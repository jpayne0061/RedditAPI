var text;
var comments = {};
var bySubReddit = {};
var commentsBySubReddit = {};
var username;

function callIt(url) {
    $.ajax({
        dataType: "jsonp",
        url: url,
        timeout: 5000,
        jsonpCallback: "callback",
        crossDomain: true,
        success: function (data) {

            console.log(data, "orginal data");
            getComments(data);

         }
         //,
    //     error: function (parsedjson, textStatus, errorThrown) {
    //     console.log("parsedJson: " + JSON.stringify(parsedjson));
       
    //     $('#data-load').append("<div id='jsonp-error'>Check your spelling. Request is taking too long</div>");        
        
    // }
        
        
    });
}


function getComments(data) {
    //log something here to DOM to show work being done

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



function getNext(response) {
    var commentsLength = response["data"]["children"].length;
    var lastCommentName = response["data"]["children"][commentsLength - 1]["data"]["name"];
    var nextComments = "https://www.reddit.com/user/" + username + "/submitted/.json?after=" + lastCommentName + "&jsonp=getComments";
    callIt(nextComments);
}

function orderBySubreddit(object) {
    for (x in object) {
        for (var i = 0; i < object[x].length; i++) {
            var subreddit = object[x][i]["data"]["subreddit"];
            if (subreddit in bySubReddit) {
                bySubReddit[subreddit][0] += object[x][i]["data"]["score"];
                bySubReddit[subreddit][1] += 1;

                commentsBySubReddit[subreddit].push([object[x][i]["data"]["title"], object[x][i]["data"]["score"], object[x][i]["data"]["permalink"]]);
            } else {
                bySubReddit[subreddit] = [];
                commentsBySubReddit[subreddit] = [];

                bySubReddit[subreddit][0] = object[x][i]["data"]["score"];
                bySubReddit[subreddit][1] = 1;

                commentsBySubReddit[subreddit].push([object[x][i]["data"]["title"], object[x][i]["data"]["score"], object[x][i]["data"]["permalink"]]);
            }

        }
    }

    sortSubreddit(bySubReddit);
}


//sortSubbreddit
function sortSubreddit(obj) {


    var sortable = [];

    for (var subreddit in obj) {
        sortable.push([subreddit, obj[subreddit][0], obj[subreddit][1]])
    }

    var sorted = sortable.sort(function (a, b) {
        return b[1] - a[1];
    })

    console.log(sorted, "sorted");
    $("#data-load").toggle();
    $("#table").css("display", "table");
    $("#table").dataTable().fnDestroy();
    MakeTable(sorted);

}

function getCommentText(object) {
    for (x in object) {
        for (var i = 0; i < object[x].length; i++) {
            text += object[x][i]["data"]["body"];
        }
    }
}


function MakeTable(result) {
    console.log("here");
    $("#table").DataTable({
        "bPaginate": false,
        "order": [[1, "desc"]],
        "bFilter": false,
        "bInfo": false,
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
                    return "<a class='comments-link' id=" + data + ">" + "See Submissions" + "</a>";
                }
            }

        ]
    });

}

function MakeCommentsTable(result) {
    console.log(result, "seeee it!")
    $("#comment-table").DataTable({
        "bPaginate": false,
        "order": [[1, "desc"]],
        "bFilter": false,
        "bInfo": false,
        data: result,
        columns: [
            {

                "render": function (data, type, row) {
                    return '<a href="https://reddit.com' + row[2] + '">' + row[0] + '</a>';
                }
            },
            {
                data: [1]
            }

        ]
    });

}


function enterEvent(username) {
    $("#input-left").css("display", "block");

    $("#data-load").toggle();
    comments = {};
    bySubReddit = {};

    $("#input-middle").empty();
    var url = "https://www.reddit.com/user/" + username + "/submitted.json?jsonp=?";
    console.log(url);
    callIt(url, username);

}


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

})


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
