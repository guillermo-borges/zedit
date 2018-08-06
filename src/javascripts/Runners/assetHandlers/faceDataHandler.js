ngapp.run(function(mergeAssetService, assetHelpers, mergeLogger) {
    let {copyAsset, findGameAssets} = assetHelpers,
        {forEachPlugin} = mergeAssetService;

    let faceGeomPath = 'meshes\\actors\\character\\facegendata\\facegeom\\',
        faceTintPath = 'textures\\actors\\character\\facegendata\\facetint\\',
        faceDataExpr = /([0-9A-F]{8})\.(nif|dds)/i;

    let findFaceDataFiles = function(plugin, folder) {
        return Array.prototype.concat(
            findGameAssets(plugin, folder, faceTintPath + plugin, '*'),
            findGameAssets(plugin, folder, faceGeomPath + plugin, '*')
        );
    };

    let getFaceDataNpc = function(pluginFile, filePath) {
        if (!pluginFile) return '';
        let loadOrder = xelib.GetFileLoadOrder(pluginFile) * 0x1000000,
            npcFormId = loadOrder + parseInt(fh.getFileBase(filePath), 16),
            npcRecord = xelib.GetRecord(pluginFile, npcFormId);
        return npcRecord ? xelib.Name(npcRecord) : '';
    };

    mergeAssetService.addHandler({
        label: 'Face Data Files',
        priority: 0,
        get: function(merge) {
            forEachPlugin(merge, (plugin, folder, pluginFile) => {
                let sliceLen = folder.length;
                findFaceDataFiles(plugin, folder).forEach(filePath => {
                    merge.faceDataFiles.push({
                        plugin: plugin,
                        filePath: filePath.slice(sliceLen),
                        npc: getFaceDataNpc(pluginFile, filePath)
                    });
                });
            });
        },
        handle: function(merge) {
            if (!merge.handleFaceData || !merge.faceDataFiles.length) return;
            mergeLogger.log(`Handling Face Data Files`);
            merge.faceDataFiles.forEach(asset => {
                copyAsset(asset, merge, faceDataExpr);
            });
        }
    });
});