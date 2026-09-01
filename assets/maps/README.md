# 历史地图数据说明

`world_1634_global_overview.js` 是《残明余烬》1634 年世界视图的发布资产，按以下优先级合成并执行多边形差集裁剪：

1. 项目内的 1634 年东亚细分复原，用于明代行政区、后金、蒙古诸部及东亚周边；
2. [Seshat Global History Databank / Cliopatria](https://github.com/Seshat-Global-History-Databank/cliopatria) v0.2.0 的 1634 年政权快照，用于全球历史政权边界；
3. 项目内南亚、东南亚、澳洲等宏观分区，仅填补 Cliopatria 没有覆盖的空白；
4. [aourednik/historical-basemaps](https://github.com/aourednik/historical-basemaps) 的 1650 年宏观图，仅用于其余没有精确政权记录处的地理覆盖，不视为 1634 年政权边界。

低优先级多边形会先减去高优先级多边形的实际覆盖面积，再写入发布资产；不同来源不再以完整政权面直接叠加。

Cliopatria 与 Historical Basemaps 均按 CC BY 4.0 提供。仓库对数据进行了筛选、中文命名、东亚覆盖、时间错置条目剔除和发布格式转换；具体变更规则见 `scripts/extract-cliopatria-1634.mjs` 与 `scripts/build-world-map-overview.mjs`。

历史疆界本身存在史料分歧和模糊地带。地图适合叙事与游戏态势展示，不应作为现代主权主张或出版级历史地图使用。
