function getAllGroups() {

    return (chrome.tabGroups.query({}));

}

function getAllTabsInGroup(groupId) {

    console.log(parseInt(groupId));

    return (chrome.tabs.query({
        groupId: parseInt(groupId)
    }));

}

function saveGroup() {

    getAllTabsInGroup(this.id).then(tabs => {

        tabs.forEach(tab => {
            
            console.log(tab);

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