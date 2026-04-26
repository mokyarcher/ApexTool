"""
在 Blender Python 控制台中运行此脚本
将所有动画合并为一个动作，方便导出 GLB 后 model-viewer 播放
"""
import bpy

# 找到骨架
armature = None
for obj in bpy.data.objects:
    if obj.type == 'ARMATURE':
        armature = obj
        break

if not armature:
    print("未找到骨架！")
else:
    # 选中骨架
    bpy.ops.object.select_all(action='DESELECT')
    armature.select_set(True)
    bpy.context.view_layer.objects.active = armature

    # 收集所有动作
    actions = [a for a in bpy.data.actions]
    print(f"找到 {len(actions)} 个动作:")
    for a in actions:
        print(f"  - {a.name} ({a.frame_range[0]:.0f} ~ {a.frame_range[1]:.0f})")

    # 清除现有 NLA 轨道
    if armature.animation_data:
        for track in list(armature.animation_data.nla_tracks):
            armature.animation_data.nla_tracks.remove(track)

    # 把所有动作添加到 NLA 轨道
    if not armature.animation_data:
        armature.animation_data_create()

    for action in actions:
        track = armature.animation_data.nla_tracks.new()
        track.name = action.name
        strip = track.strips.new(action.name, int(action.frame_range[0]), action)
        strip.blend_type = 'COMBINE'

    # 计算总帧范围
    frame_start = min(a.frame_range[0] for a in actions)
    frame_end = max(a.frame_range[1] for a in actions)

    # 烘焙动作
    bpy.ops.nla.bake(
        frame_start=int(frame_start),
        frame_end=int(frame_end),
        step=1,
        only_selected=False,
        visual_keying=True,
        clear_constraints=False,
        bake_types={'POSE'}
    )

    # 重命名烘焙后的动作
    if armature.animation_data and armature.animation_data.action:
        armature.animation_data.action.name = "CombinedAction"

    # 删除旧的 NLA 轨道
    for track in list(armature.animation_data.nla_tracks):
        armature.animation_data.nla_tracks.remove(track)

    # 删除旧动作（只保留合并后的）
    for action in actions:
        if action.name != "CombinedAction":
            action.use_fake_user = False
            if action.users == 0:
                bpy.data.actions.remove(action)

    print(f"完成！已合并为 CombinedAction ({int(frame_start)} ~ {int(frame_end)})")
    print("现在可以导出 GLB 了")
