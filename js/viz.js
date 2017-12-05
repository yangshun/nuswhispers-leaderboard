var sort_comment, sort_like, sort_score;

function type(d) {
    d.activity_score = +d.activity_score;
    d.like_count = +d.like_count;
    d.comment_count = +d.comment_count;
    return d;
}

function text_display(string) {
    string = string.replace("_", " ");
    return string.charAt(0).toUpperCase() + string.slice(1);
}

d3.json("leaderboard/latest.json", function (error, data) {
    document.getElementById("buttons").style.visibility = "visible";

    for (item in data) {
        data[item] = type(data[item]);
    }

    var text_offset = 6 * d3.max(data, function (d) {
        return d.name.length;
    });
    var label_offset = 40;
    var legend_top_offset = 30;
    var width = document.getElementById('viz_size_ref').clientWidth - text_offset - label_offset,
        barHeight = 30;

    // http://paletton.com/#uid=72N0u0keir800++00++Xr1cXr1c
    // score, like, comment
    var color = d3.scale.ordinal()
        .range(["#FEB074", "#479C96", "#6AD05F"]); //#F97279

    color.domain(d3.keys(data[0]).filter(function (key) {
        return key !== "name" && key != "facebook_id";
    }));

    // scaling
    var scale = d3.scale.linear()
        .domain([0, d3.max(data, function (d) {
            return d.activity_score;
        })])
        .range([0, width]);

    // Ordering
    var index = d3.range(data.length);
    var order = d3.scale.ordinal()
        .domain(index)
        .range(d3.range(data.length));

    var chart = d3.select(".chart")
        .attr("width", width + text_offset + label_offset)
        .attr("height", barHeight * data.length);
    var bar = chart.selectAll("g");
    var barUpdate = bar.data(data);
    var barEnter = barUpdate.enter().append("g")
        .attr("transform", function (d, i) {
            return "translate(0," + (order(i) * barHeight + legend_top_offset) + ")";
        });
    var barEnterTop = barUpdate.enter().append("g")
        .attr("transform", function (d, i) {
            return "translate(0," + (order(i) * barHeight + legend_top_offset) + ")";
        });

    // Name
    barEnter.append("text")
        .attr("x", 0)
        .attr("y", barHeight / 2)
        .attr("dy", ".35em")
        .text(function (d) {
            return d.name;
        })
        .style("text-anchor", "start");


    // Activity Score
    barEnter.append("rect")
        .attr("x", text_offset)
        .attr("width", function (d) {
            return scale(d.activity_score);
        })
        .attr("height", barHeight - 1)
        .style("fill", color("activity_score"));

    barEnterTop.append("text")
        .attr("x", function (d) {
            return text_offset + scale(d.activity_score) + 3;
        })
        .attr("y", barHeight / 2)
        .attr("dy", ".35em")
        .text(function (d) {
            return d.activity_score;
        })
        .style("text-anchor", "start");

    //Comments
    var comment_bar = barEnter.append("rect")
        .attr("x", text_offset)
        .attr("width", function (d) {
            return scale(d.comment_count);
        })
        .attr("height", barHeight - 1)
        .style("fill", color("comment_count"));

    var comment_text = barEnterTop.append("text")
        .attr("x", function (d) {
            return text_offset + scale(d.comment_count) - 1;
        })
        .attr("y", barHeight / 2)
        .attr("dy", ".35em")
        .text(function (d) {
            return d.comment_count;
        })
        .style("text-anchor", "end");

    //Likes
    var like_bar = barEnter.append("rect")
        .attr("x", function (d) {
            return text_offset + scale(d.comment_count);
        })
        .attr("width", function (d) {
            return scale(d.like_count);
        })
        .attr("height", barHeight - 1)
        .style("fill", color("like_count"));

    var like_text = barEnterTop.append("text")
        .attr("x", function (d) {
            return text_offset + scale(d.comment_count) + scale(d.like_count) - 1;
        })
        .attr("y", barHeight / 2)
        .attr("dy", ".35em")
        .text(function (d) {
            return d.like_count;
        })
        .style("text-anchor", "end");

    var legend = chart.selectAll(".legend")
        .data(color.domain().slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate(" + i * 200 + "," + 0 + ")";
        });

    legend.append("rect")
        .attr("x", text_offset + label_offset*2 + 15)
        .attr("y", 0)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", text_offset + label_offset*2 + 13)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d) {
            return text_display(d);
        });

    sort_ratio = function () {

        $(".sort_btn").removeClass("active");
        $(".sort_ratio").addClass("active");

        index.sort(function (a, b) {
            return -(data[a].like_count / data[a].comment_count - data[b].like_count / data[b].comment_count);
        });
        // Reorder the horizontally
        comment_bar.transition()
            .duration(200)
            .attr("x", text_offset);
        comment_text.transition()
            .duration(200)
            .attr("x", function (d) {
                return text_offset + scale(d.comment_count) - 1;
            })
        like_bar.transition()
            .duration(200)
            .attr("x", function (d) {
                return text_offset + scale(d.comment_count);
            })
        like_text.transition()
            .duration(200)
            .attr("x", function (d) {
                return text_offset + scale(d.comment_count) + scale(d.like_count) - 1;
            });
        transition();
    }

    sort_comment = function () {

        $(".sort_btn").removeClass("active");
        $(".sort_comment").addClass("active");

        index.sort(function (a, b) {
            return -(data[a].comment_count - data[b].comment_count);
        });
        // Reorder the horizontally
        comment_bar.transition()
            .duration(200)
            .attr("x", text_offset);
        comment_text.transition()
            .duration(200)
            .attr("x", function (d) {
                return text_offset + scale(d.comment_count) - 1;
            })
        like_bar.transition()
            .duration(200)
            .attr("x", function (d) {
                return text_offset + scale(d.comment_count);
            })
        like_text.transition()
            .duration(200)
            .attr("x", function (d) {
                return text_offset + scale(d.comment_count) + scale(d.like_count) - 1;
            });
        transition();
    }

    sort_like = function () {

        $(".sort_btn").removeClass("active");
        $(".sort_like").addClass("active");

        index.sort(function (a, b) {
            return -(data[a].like_count - data[b].like_count);
        });
        // Reorder the horizontally
        comment_bar.transition()
            .duration(200)
            .attr("x", function (d) {
                return text_offset + scale(d.like_count)
            });
        comment_text.transition()
            .duration(200)
            .attr("x", function (d) {
                return text_offset + scale(d.comment_count) + scale(d.like_count) - 1;
            })
        like_bar.transition()
            .duration(200)
            .attr("x", text_offset);
        like_text.transition()
            .duration(200)
            .attr("x", function (d) {
                return text_offset + scale(d.like_count) - 1;
            });
        transition();
    }

    sort_score = function () {

        $(".sort_btn").removeClass("active");
        $(".sort_score").addClass("active");

        index.sort(function (a, b) {
            return -(data[a].activity_score - data[b].activity_score);
        });
        // Reorder the horizontally
        comment_bar.transition()
            .duration(200)
            .attr("x", text_offset);
        comment_text.transition()
            .duration(200)
            .attr("x", function (d) {
                return text_offset + scale(d.comment_count) - 1;
            })
        like_bar.transition()
            .duration(200)
            .attr("x", function (d) {
                return text_offset + scale(d.comment_count);
            })
        like_text.transition()
            .duration(200)
            .attr("x", function (d) {
                return text_offset + scale(d.comment_count) + scale(d.like_count) - 1;
            });
        transition();
    }

    var transition = function () {
        order.domain(index);

        barEnter.transition()
            .duration(200)
            .delay(function (d, i) {
                return i * 5;
            })
            .attr("transform", function (d, i) {
                return "translate(0," + (order(i) * barHeight + legend_top_offset) +")";
            });

        barEnterTop.transition()
            .duration(200)
            .delay(function (d, i) {
                return i * 5;
            })
            .attr("transform", function (d, i) {
                return "translate(0," + (order(i) * barHeight + legend_top_offset) + ")";
            });
    }

})