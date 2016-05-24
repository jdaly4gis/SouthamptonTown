function getUser() {
    var Store = new dojox.data.QueryReadStore({ url: 'getUserID.ashx' });
    //buildingStore.doClientSorting = true;
    Store.fetch({ serverQuery: {},
        onComplete: function (items, request) {
            alert(items[0].i.userName);
        }

    });
}