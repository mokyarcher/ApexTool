bl_info = {
    "name": "Apex Legends Texture Setup",
    "author": "ApexTool",
    "version": (1, 0, 0),
    "blender": (3, 6, 0),
    "location": "View3D > Sidebar > Apex",
    "description": "自动配置 Apex Legends 模型的 PBR 贴图",
    "category": "Material",
}

import bpy
import os
from pathlib import Path
from collections import defaultdict


# ── 贴图后缀 → 用途映射 ──
SUFFIX_MAP = {
    "_col": "color",
    "_nml": "normal",
    "_gls": "gloss",
    "_spc": "specular",
    "_ao": "ao",
    "_ilm": "emission",
    "_cav": "cavity",
}


def detect_texture_groups(folder):
    """扫描文件夹，按部件名分组贴图"""
    groups = defaultdict(dict)
    for f in Path(folder).glob("*.png"):
        stem = f.stem.lower()
        for suffix, role in SUFFIX_MAP.items():
            if stem.endswith(suffix):
                part_name = stem[: -len(suffix)]
                groups[part_name][role] = str(f)
                break
    return dict(groups)


def create_image_node(nodes, filepath, label, color_space="sRGB", x=0, y=0):
    """创建图像纹理节点"""
    node = nodes.new("ShaderNodeTexImage")
    node.image = bpy.data.images.load(filepath, check_existing=True)
    node.image.colorspace_settings.name = color_space
    node.label = label
    node.location = (x, y)
    node.hide = True
    return node


def build_material(part_name, textures):
    """为一个部件创建完整 PBR 材质"""
    mat_name = f"Apex_{part_name}"

    # 复用已有材质或新建
    mat = bpy.data.materials.get(mat_name)
    if mat:
        mat.node_tree.nodes.clear()
    else:
        mat = bpy.data.materials.new(name=mat_name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    # ── 输出节点 ──
    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (600, 0)

    # ── Principled BSDF ──
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (200, 0)
    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])

    x_start = -800
    y = 300

    # ── Color (col) ──
    col_output = None
    if "color" in textures:
        col_node = create_image_node(nodes, textures["color"], "Color", "sRGB", x_start, y)
        col_output = col_node.outputs["Color"]
        y -= 80

    # ── AO ──
    if "ao" in textures and col_output:
        ao_node = create_image_node(nodes, textures["ao"], "AO", "Non-Color", x_start, y)
        mix_ao = nodes.new("ShaderNodeMix")
        mix_ao.data_type = 'RGBA'
        mix_ao.blend_type = "MULTIPLY"
        mix_ao.inputs["Factor"].default_value = 0.4
        mix_ao.label = "AO Multiply"
        mix_ao.location = (x_start + 300, y + 40)
        mix_ao.hide = True
        links.new(col_output, mix_ao.inputs[6])       # A
        links.new(ao_node.outputs["Color"], mix_ao.inputs[7])  # B
        col_output = mix_ao.outputs[2]  # Result
        y -= 80

    # ── Cavity ──
    if "cavity" in textures and col_output:
        cav_node = create_image_node(nodes, textures["cavity"], "Cavity", "Non-Color", x_start, y)
        mix_cav = nodes.new("ShaderNodeMix")
        mix_cav.data_type = 'RGBA'
        mix_cav.blend_type = "MULTIPLY"
        mix_cav.inputs["Factor"].default_value = 0.2
        mix_cav.label = "Cavity Multiply"
        mix_cav.location = (x_start + 300, y + 40)
        mix_cav.hide = True
        links.new(col_output, mix_cav.inputs[6])
        links.new(cav_node.outputs["Color"], mix_cav.inputs[7])
        col_output = mix_cav.outputs[2]
        y -= 80

    # 连接最终颜色 → Base Color
    if col_output:
        links.new(col_output, bsdf.inputs["Base Color"])

    # ── Normal (nml) ──
    if "normal" in textures:
        nml_tex = create_image_node(nodes, textures["normal"], "Normal", "Non-Color", x_start, y)
        nml_node = nodes.new("ShaderNodeNormalMap")
        nml_node.location = (x_start + 300, y)
        nml_node.hide = True
        links.new(nml_tex.outputs["Color"], nml_node.inputs["Color"])
        links.new(nml_node.outputs["Normal"], bsdf.inputs["Normal"])
        y -= 80

    # ── Gloss (gls) → Invert → Roughness ──
    if "gloss" in textures:
        gls_tex = create_image_node(nodes, textures["gloss"], "Gloss", "Non-Color", x_start, y)
        invert = nodes.new("ShaderNodeInvert")
        invert.location = (x_start + 300, y)
        invert.hide = True
        invert.label = "Gloss→Rough"
        links.new(gls_tex.outputs["Color"], invert.inputs["Color"])
        links.new(invert.outputs["Color"], bsdf.inputs["Roughness"])
        y -= 80

    # ── Specular (spc) ──
    if "specular" in textures:
        spc_tex = create_image_node(nodes, textures["specular"], "Specular", "Non-Color", x_start, y)
        links.new(spc_tex.outputs["Color"], bsdf.inputs["Specular IOR Level"])
        y -= 80

    # ── Emission (ilm) ──
    if "emission" in textures:
        ilm_tex = create_image_node(nodes, textures["emission"], "Emission", "sRGB", x_start, y)
        links.new(ilm_tex.outputs["Color"], bsdf.inputs["Emission Color"])
        bsdf.inputs["Emission Strength"].default_value = 5.0
        y -= 80

    return mat


# ── Blender Operator ──
class APEX_OT_setup_textures(bpy.types.Operator):
    bl_idname = "apex.setup_textures"
    bl_label = "配置 Apex 贴图"
    bl_description = "从文件夹加载贴图并自动创建 PBR 材质"
    bl_options = {"REGISTER", "UNDO"}

    directory: bpy.props.StringProperty(subtype="DIR_PATH")
    auto_assign: bpy.props.BoolProperty(
        name="自动分配到选中物体",
        default=True,
    )

    def invoke(self, context, event):
        context.window_manager.fileselect_add(self)
        return {"RUNNING_MODAL"}

    def execute(self, context):
        folder = self.directory
        if not folder or not os.path.isdir(folder):
            self.report({"ERROR"}, "请选择有效的贴图文件夹")
            return {"CANCELLED"}

        groups = detect_texture_groups(folder)
        if not groups:
            self.report({"ERROR"}, f"在 {folder} 中未找到 Apex 贴图")
            return {"CANCELLED"}

        # 切换色彩管理为 Standard，避免 Filmic 压暗颜色
        scene = context.scene
        scene.view_settings.view_transform = "Standard"
        scene.view_settings.look = "None"

        materials = []
        for part_name, textures in sorted(groups.items()):
            mat = build_material(part_name, textures)
            materials.append(mat)
            self.report({"INFO"}, f"✓ 创建材质: {mat.name} ({len(textures)} 张贴图)")

        # 自动分配：把材质按部件名匹配到选中物体的材质槽
        if self.auto_assign and context.selected_objects:
            for obj in context.selected_objects:
                if obj.type != "MESH":
                    continue
                for mat in materials:
                    # 尝试匹配已有材质槽名称
                    assigned = False
                    for i, slot in enumerate(obj.material_slots):
                        if slot.material and slot.material.name.lower().replace("apex_", "") in mat.name.lower():
                            obj.material_slots[i].material = mat
                            assigned = True
                            break
                    if not assigned:
                        obj.data.materials.append(mat)

        self.report({"INFO"}, f"完成！共创建 {len(materials)} 个材质（{sum(len(t) for t in groups.values())} 张贴图）")
        return {"FINISHED"}


# ── Blender Panel ──
class APEX_PT_texture_panel(bpy.types.Panel):
    bl_label = "Apex 贴图配置"
    bl_idname = "APEX_PT_texture_panel"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "Apex"

    def draw(self, context):
        layout = self.layout
        layout.label(text="Apex Legends 模型贴图工具", icon="MATERIAL")
        layout.separator()

        box = layout.box()
        box.label(text="使用说明:", icon="INFO")
        col = box.column(align=True)
        col.label(text="1. 选中需要配置贴图的模型")
        col.label(text="2. 点击下方按钮选择贴图文件夹")
        col.label(text="3. 插件自动识别并连接所有贴图")
        layout.separator()

        layout.label(text="支持的贴图类型:", icon="IMAGE_DATA")
        grid = layout.grid_flow(columns=2, align=True)
        grid.label(text="_col → 颜色")
        grid.label(text="_nml → 法线")
        grid.label(text="_gls → 光泽")
        grid.label(text="_spc → 高光")
        grid.label(text="_ao  → 环境光遮蔽")
        grid.label(text="_ilm → 自发光")
        grid.label(text="_cav → 腔体")
        layout.separator()

        row = layout.row(align=True)
        row.scale_y = 1.5
        row.operator("apex.setup_textures", text="选择贴图文件夹", icon="FILE_FOLDER")


# ── 注册 ──
classes = (
    APEX_OT_setup_textures,
    APEX_PT_texture_panel,
)

def register():
    for cls in classes:
        bpy.utils.register_class(cls)

def unregister():
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)

if __name__ == "__main__":
    register()
