function createBookmarkParent() {

    return (chrome.bookmarks.create({title: "TabGroupSaver"}));

}

function getBookmarkParent() {

    return new Promise((resolve, reject) => {

        chrome.bookmarks.getTree().then(bookmarkTree => {
            
            var otherBookmarks = bookmarkTree[0].children.find(child => child.id == "2");
            var bookmarkParent = otherBookmarks.children.find(child => child.title == "TabGroupSaver");

            if(bookmarkParent == null) {

                createBookmarkParent().then(newBookmarkParent => {

                    resolve(newBookmarkParent);

                });

            } else {

                resolve(bookmarkParent);

            }

        });

    });

}

function createBookmarkGroup(groupName, groupId) {

    return new Promise((resolve, reject) => {

        getBookmarkParent().then(bookmarkParent => {

            chrome.bookmarks.create({parentId: bookmarkParent.id, title: groupName + " - " + groupId}).then(bookmarkGroup => {

                resolve(bookmarkGroup);

            })

        });
        
    });

}

function createTabBookmark(tab, bookmarkGroupId) {

    return (chrome.bookmarks.create({parentId: bookmarkGroupId, title: tab.title, url: tab.url}));

}

function getAllGroups() {

    return (chrome.tabGroups.query({}));

}

function getGroup(groupId) {

    return (chrome.tabGroups.get(parseInt(groupId)));

}

function getAllTabsInGroup(groupId) {

    // Not working
    // return (chrome.tabs.query({
    //     groupId: parseInt(groupId)
    // }));

    return new Promise((resolve, reject) => {

        chrome.tabs.query({}).then(tabs => {

            var tabsInGroup = tabs.filter(tab => tab.groupId == groupId);

            resolve(tabsInGroup);

        });

    });

}

function saveGroup() {

    return new Promise((resolve, reject) => {

        getGroup(this.id).then(group => {

            createBookmarkGroup(group.title, group.id).then(bookmarkGroup => {

                getAllTabsInGroup(group.id).then(tabs => {

                    tabs.forEach(tab => {
                        
                        createTabBookmark(tab, bookmarkGroup.id).then(tabBookmark => {

                            chrome.tabs.remove(tab.id);

                        });
        
                    });
                    
                    location.reload();
        
                    resolve();

                });

            })        

        });

    });

}

var groupsList = document.getElementById("groupsList");

getAllGroups().then(groups => {

    groups.forEach(group => {

        if(group.title == "") {

            group.title = "Un-named"

        }

        var groupDiv = document.createElement("li");
        var groupName = document.createTextNode(group.title);

        var groupSaveButton = document.createElement("button");
        var groupSaveButtonLabel = document.createTextNode("Save");

        groupSaveButton.id = group.id;
        groupSaveButton.addEventListener("click", saveGroup);

        groupDiv.appendChild(groupName);
        groupDiv.appendChild(groupSaveButton);
        groupSaveButton.appendChild(groupSaveButtonLabel);
        groupsList.appendChild(groupDiv);

    });

});