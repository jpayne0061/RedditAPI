
var text;
var comments = {};
var bySubReddit = {};
var commentsBySubReddit = {};

//wrap this in a closure to take care of username global variable,
//or pass through functions
//save page, and try to pass all of these through funcitons
var username;


function getNext(response) {
    var commentsLength = response["data"]["children"].length;
    var lastCommentName = response["data"]["children"][commentsLength - 1]["data"]["name"];
    var nextComments = "https://www.reddit.com/user/" + username + "/comments/.json?after=" + lastCommentName + "&jsonp=getComments";
    callIt(nextComments);
}

//sortSubbreddit
function sortSubreddit(obj) {
    var sortable = [];

    for (var subreddit in obj) {
        sortable.push([subreddit, obj[subreddit][0], obj[subreddit][1] ])
    }

    var sorted = sortable.sort(function (a, b) {
        return b[1] - a[1];
    })

    console.log(sorted, "sorted");
    $("#data-load").toggle();
    //$("#table").DataTable().clear();
    $("#table").css("display", "table");
    $("#table").dataTable().fnDestroy();
    MakeTable(sorted);
    //call coutnWords here, and construct stats column
    //see raw data option
    
    
}

function getComments(data) {
    //console.log("get comments called", data);
    var commentsLength = data["data"]["children"].length;
    if (data["data"]["after"] == null) {
        comments["last"] = data["data"]["children"];
        orderBySubreddit(comments);
    }
    else {
        comments[data["data"]["after"]] = data["data"]["children"];
        getNext(data);
    }
}

function getCommentText(object) {
    for (x in object) {
        for (var i = 0; i < object[x].length; i++) {
            text += object[x][i]["data"]["body"];
        }
    }
}


function orderBySubreddit(object) {
    for (x in object) {
        for (var i = 0; i < object[x].length; i++) {
            //console.log(object[x][i]["data"]);
            //bySubReddit[];
            var subreddit = object[x][i]["data"]["subreddit"];
            if( subreddit in bySubReddit){
                bySubReddit[subreddit][0] += object[x][i]["data"]["score"];
                bySubReddit[subreddit][1] += 1;

                commentsBySubReddit[subreddit].push([object[x][i]["data"]["body"], object[x][i]["data"]["score"]]);
            } else {
                bySubReddit[subreddit] = [];
                commentsBySubReddit[subreddit] = [];

                bySubReddit[subreddit][0] = object[x][i]["data"]["score"];
                bySubReddit[subreddit][1] = 1;

                commentsBySubReddit[subreddit].push([object[x][i]["data"]["body"], object[x][i]["data"]["score"]]);
            }

        }
    }

    //console.log(commentsBySubReddit);

    sortSubreddit(bySubReddit);
}

function MakeTable(result) {
    $("#table").DataTable({
        "bPaginate": false,
        "order": [[1, "desc"]],
        "bFilter": false,
        "bInfo" : false,
        data: result,
        columns: [
            {
                data: [0]
            },
            {
                data: [1]
            },
            {
                data: [2]
            },
            {
                data: [0],
                render: function (data) {
                    return "<a class='comments-link' id=" + data + ">" + "See Comments" + "</a>";
                }
            }

        ]
    });

}

function MakeCommentsTable(result) {
    $("#comment-table").DataTable({
        "bPaginate": false,
        "order": [[1, "desc"]],
        "bFilter": false,
        "bInfo" : false,
        data: result,
        columns: [
            {
                data: [0]
            },
            {
                data: [1]
            }

        ]
    });

}



function callIt(url) {
    $.ajax({
        dataType: "jsonp",
        url: url,
        dataType: "jsonp",
        jsonpCallback: "callback",
        crossDomain: true,
        timeout: 5000,
        success: function (data) {

            //console.log(data, "orginal data");
            getComments(data);

        },
        error: function () {
            $("#data-load").html("<span id='error-message'>Error. Check the spelling of the username</span>");
            console.log("JSONP ERROR!");
        }
    });
}


function enterEvent(username) {
    $("#input-left").css("display", "block");

    $("#data-load").toggle();
    //$("#table").css("display", "table");
    comments = {};
    bySubReddit = {};

     //$("#username-form").val();
    $("#input-middle").empty();
    var url = "https://www.reddit.com/user/" + username + "/comments.json?jsonp=?";
    console.log(url);
    //var url = "https://www.reddit.com/user/" + username + "/comments.json?jsonp=getComments";
    callIt(url, username);

}

//COPY THIS FOR LINKS PAGE!!!!!!

$(document).on("click", ".report-button", function () {
    username = $(this).prev().val();
    enterEvent(username);
});



$(document).on("click", ".comments-link", function (e) {
    e.preventDefault();

    $("#comment-table").css("display", "table");
    $("#table").css("display", "none");
    $("#back-to-table").toggle();
    var subreddit = $(this).attr("id");
    $("#comment-table").dataTable().fnDestroy();
    MakeCommentsTable(commentsBySubReddit[subreddit]);

});


$(document).on("click", "#back-to-table", function (e) {
    e.preventDefault();

    $("#comment-table").css("display", "none");
    $("#table").css("display", "table");
    $("#back-to-table").toggle();

});

$('.form-control').keyup(function (e) {
    if (e.keyCode == 13) {
        username = $(this).val();
        console.log(username);
        enterEvent(username);
    }
});





//exclude results with less than 1
//replace any "...." with whitespace, then split
//find a way to elminate n/ character, it show up as weird arrow
//lowercase all before filtering
//maybe iterrate through each comment and perform funciton like this,
//so people can see in which comment they have written a word.
//scrape 1000 most used words and see if your comments contain any words not
//used in the 1000 words

function countWords(string) {
    var wordCount = {};
    var split = string.split(" ");
    var common = ["the", "of", "and", "a", "to", "in", "is", "you", "that", "it", "he", "was", "for", "on", "are", "as", "with", "his", "they", "I", "at", "be", "this", "have", "from", "or", "one", "had", "by", "word", "but", "not", "what", "all", "were", "we", "when", "your", "can", "said", "there", "use", "an", "each", "which", "she", "do", "how", "their", "if", "will", "up", "other", "about", "out", "many", "then", "them", "these", "so"];
    for (var i = 0; i < split.length; i++) {
        if (split[i] in wordCount) {
            wordCount[split[i]] += 1;
        } else if (common.indexOf(split[i]) == -1) {
            wordCount[split[i]] = 1;
        }
    }
    return wordCount;
}





