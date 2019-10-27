ngapp.run(function(viewFactory, viewLinkingInterface) {
    let newView = function() {
        let view = viewFactory.new('filterView');

        view.destroy = function() {
            view.scope.treeView.destroy();
            view.searchOptions.nodes.forEach(node => {
                xelib.Release(node.handle);
            });
            view.results.forEach(xelib.Release);
        };

        viewLinkingInterface(view, 'linkedFilterView', [
            'record-view'
        ]);

        return view;
    };

    viewFactory.registerView({
        id: 'filterView',
        name: 'Filter View',
        new: newView,
        isAccessible: () => false
    });
});