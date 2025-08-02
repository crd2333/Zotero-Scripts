# Zotero Actions Collection of crd2333

Zotero has a [zotero-actions-tags](https://github.com/windingwind/zotero-actions-tags) add-on, which allows you to do various actions on Zotero items (more than add/remove tags). This is a list of actions that I have created for Zotero items.

Zotero 拥有一个 [zotero-actions-tags](https://github.com/windingwind/zotero-actions-tags) 插件，允许您对 Zotero 项目执行各种操作（不仅仅是添加/删除标签）。这是我为 Zotero 项目创建的操作列表。

## Arxiv 时间戳 (Arxiv Timestamp)
This action use the `url` of an item to fetch the arXiv submission date and version info, and then modify the `date` to the oldest submission date (which is more in line with the meaning of "arxiv preprint"), and append (or update) the version info to the `extra` field.

这个脚本使用项目的网址 `url` 来获取 arXiv 提交日期和版本信息，然后将日期 `date` 修改为最早的提交日期（这更符合“arxiv 预印本”的意义），并将版本信息附加（或更新）到 `extra` 字段。

## 期刊会议归类 (Journal/Conference Classification)
This action classifies items into journals or conferences based on their metadata, such as `publicationTitle`, `proceedingsTitle`, `conferenceName`, etc. It adds appropriate tags like `#NeurIPS 2020` or `#CVPR 2022` to the items. Of course, it may not cover all cases, and you can add more tags as needed.

这个脚本根据 Zotero 项目的元数据（例如会议论文集标题 `proceedingsTitle`、会议名称 `conferenceName`、刊名 `publicationTitle` 等），获取会议或期刊信息及其时间，并添加适当的 `#` 标签，例如 `#NeurIPS 2020`, `#CVPR 2022`。当然可能不全，你可以根据需要自行添加。

## 标签清理 (Tag Cleanup)
This action cleans up tags by removing unnecessary ones, deleting meaningless prefixes (like `Computer Science - `) when importing from `Arxiv`, and replacing certain tags with more appropriate ones based on a predefined dictionary. You can modify the arrays and dictionary as needed.

这个脚本定义了两个数组和一个字典，清除不需要的标签，删除从 `Arxiv` 导入时的无意义前缀（如 `Computer Science - `），同时能根据预定义的字典将某些标签转换为更合适的标签。你可以根据需要修改这些数组和字典。
```js
const tagToRemove = [ "a" ];
const prefixesToClean = [ "Computer Science - " ];
const tagReplacements = { "a": "b" };
```
