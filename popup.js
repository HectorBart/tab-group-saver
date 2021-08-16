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

    }).catch(err => {

        reject(err);

    });

}

function createBookmarkGroup(groupName, groupId) {

    return new Promise((resolve, reject) => {

        getBookmarkParent().then(bookmarkParent => {

            chrome.bookmarks.create({parentId: bookmarkParent.id, title: groupName + " - " + groupId}).then(bookmarkGroup => {

                resolve(bookmarkGroup);

            })

        });
        
    }).catch(err => {

        reject(err);

    });

}

function createTab(url) {

    return (chrome.tabs.create({url: url, active: false}));

}

function createTabGroup(groupName, tabs) {

    var tabIds = [];

    tabs.forEach(tab => {

        tabIds.push(tab.id);

    });

    return new Promise((resolve, reject) => {

        chrome.tabs.group({tabIds: tabIds}).then(groupId => {

            chrome.tabGroups.update(groupId, {title: groupName, collapsed: true}).then(groupUpdate => {

                resolve(groupUpdate);

            });

        }).catch(err => {

            reject(err);

        });

    }).catch(err => {

        reject(err);

    });    

}

function createTabBookmark(tab, bookmarkGroupId) {

    return (chrome.bookmarks.create({parentId: bookmarkGroupId, title: tab.title, url: tab.url}));

}

function getAllBookmarks() {

    return new Promise((resolve, reject) => {

        chrome.bookmarks.getTree().then(bookmarkTree => {
            
            var otherBookmarks = bookmarkTree[0].children.find(child => child.id == "2");
            var bookmarkParent = otherBookmarks.children.find(child => child.title == "TabGroupSaver");

            resolve(bookmarkParent.children);

        });

    }).catch(err => {

        reject(err);

    });


}

function getBookmark(bookmarkId) {

    return (chrome.bookmarks.get(bookmarkId));

}

function getBookmarkWithChildren(bookmarkId) {

    return new Promise((resolve, reject) => {

        chrome.bookmarks.getTree().then(bookmarkTree => {
            
            var otherBookmarks = bookmarkTree[0].children.find(child => child.id == "2");
            var bookmarkGroups = otherBookmarks.children.find(child => child.title == "TabGroupSaver");
            var bookmarkGroup = bookmarkGroups.children.find(child => child.id == bookmarkId);

            resolve(bookmarkGroup);

        });

    }).catch(err => {

        reject(err);

    });

}

function getAllGroups() {

    return (chrome.tabGroups.query({}));

}

function getGroup(groupId) {

    return (chrome.tabGroups.get(parseInt(groupId)));

}

function getAllTabsInGroup(groupId) {

    return new Promise((resolve, reject) => {

        chrome.tabs.query({}).then(tabs => {

            var tabsInGroup = tabs.filter(tab => tab.groupId == groupId);

            resolve(tabsInGroup);

        });

    }).catch(err => {

        reject(err);

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

    }).catch(err => {

        reject(err);

    });

}

function restoreBookmark() {

    return new Promise((resolve, reject) => {        

        getBookmarkWithChildren(this.id).then(bookmarkGroup => {

            Promise.all(bookmarkGroup.children.map(child => {

                return createTab(child.url);

            })).then((tabs) => {

                createTabGroup(bookmarkGroup.title.split(" - ")[0], tabs).then(tabGroup => {

                    chrome.bookmarks.removeTree(bookmarkGroup.id).then(removedBookmarkGroup => {

                        location.reload();

                        resolve();

                    });

                });

            }).catch(err => {

                reject(err);
    
            });
        
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

var bookmarksList = document.getElementById("bookmarksList");

getAllBookmarks().then(bookmarks => {

    bookmarks.forEach(bookmark => {

        var bookmarkDiv = document.createElement("li");
        var bookmarkName = document.createTextNode(bookmark.title.split(" - ")[0]);

        var bookmarkRestoreButton = document.createElement("button");
        var bookmarkRestoreButtonLabel = document.createTextNode("Restore");

        bookmarkRestoreButton.id = bookmark.id;
        bookmarkRestoreButton.addEventListener("click", restoreBookmark);

        bookmarkDiv.appendChild(bookmarkName);
        bookmarkDiv.appendChild(bookmarkRestoreButton);
        bookmarkRestoreButton.appendChild(bookmarkRestoreButtonLabel);
        bookmarksList.appendChild(bookmarkDiv);


    });

});