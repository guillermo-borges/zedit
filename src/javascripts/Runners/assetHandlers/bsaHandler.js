ngapp.run(function(mergeAssetService, assetHelpers, bsaHelpers, mergeLogger) {
    let {findBsaFiles, findGeneralAssets}  = assetHelpers,
        {forEachPlugin} = mergeAssetService;

    let actions = {
        "Copy": function({filePath}, merge) {
            let newPath = `${merge.dataPath}\\${fh.getFileName(filePath)}`;
            mergeLogger.log(`Copying ${filePath} to ${newPath}`, true);
            fh.jetpack.copy(filePath, newPath, { overwrite: true });
        },
        "Extract": function(archive, merge) {
            merge.extracted.push(bsaHelpers.extractArchive(archive));
        },
        "Merge": function(archive, merge) {
            merge.extracted.push(bsaHelpers.extractArchive(archive));
        }
    };

    mergeAssetService.addHandler({
        label: 'Bethesda Archive Files',
        priority: -1,
        get: function(merge) {
            let defaultAction = merge.buildArchive ? 'Merge' :
                (merge.extractArchives ? 'Extract' : 'Copy');
            forEachPlugin(merge, (plugin, folder) => {
                findBsaFiles(plugin, folder).forEach(bsaPath => {
                    merge.archives.push({
                        plugin: plugin,
                        filePath: bsaPath,
                        filename: fh.getFileName(bsaPath),
                        fileSize: fh.getFileSize(bsaPath),
                        action: defaultAction
                    });
                });
            });
        },
        handle: function(merge) {
            let archivesToHandle = merge.archives.filter(archive => {
                return actions.hasOwnProperty(archive.action);
            });
            if (!archivesToHandle.length) return;
            mergeLogger.log(`Handling Bethesda Archive Files`);
            merge.archives.forEach(archive => {
                let action = actions[archive.action];
                if (action) action(archive, merge);
            });
        }
    });

    mergeAssetService.addHandler({
        label: 'Extracted Files',
        priority: 100,
        handle: function(merge) {
            if (!merge.extractArchives || !merge.extracted.length) return;
            mergeLogger.log(`Handling Extracted Files`);
            merge.extracted.forEach(folder => {
                let folderLen = folder.length;
                findGeneralAssets(folder, merge).forEach(filePath => {
                    let localPath = filePath.slice(folderLen),
                        newPath = `${merge.dataPath}\\${localPath}`;
                    mergeLogger.log(`Moving ${filePath} to ${newPath}`, true);
                    fh.jetpack.move(filePath, newPath, { overwrite: true });
                });
            });
        }
    })
});