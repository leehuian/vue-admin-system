var $ = require("jquery");
var commPop = require("../commPop.js");
/**
 * 
 * @param {string} ele element
 * @param {Map} root
 * @param {object} options 
 */
var drawD3Tree = function (ele, root, options) {
    var i = 0,
        duration = 750;
    var $ele = $(ele);
    var width = $ele.width();

    var height = width;
    $ele.height(height);

    d3.select("svg").remove();
    var tree = d3.layout.tree()
        .size([width, height - 100])
        .separation(function (a, b) {
            return (a.parent == b.parent ? 1 : 2);
        });

    var diagonal = d3.svg.diagonal()
    // .projection(function (d) {
    //     return [d.y, d.x]; //返回{y,x}  //从左往右发散
    // });

    var svg = d3.select(ele).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(0,30)");

    var update = function (source) {
        //step1. 计算树的布局
        var nodes = tree.nodes(root).reverse();
        var links = tree.links(nodes);

        nodes.forEach(function (d) {
            d.y = d.depth * 100;
        });

        //step2. 数据连接，根据id绑定数据
        var node = svg.selectAll("g.node")
            .data(nodes, function (d) {
                return d.id //最初新点开的节点都没有id
                    ||
                    (d.id = ++i); //为没有id的节点添加上ID
            });

        //step3. 点击时增加新的子节点
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return "translate(" + source.x0 + "," + source.y0 + ")";
            })
            .on("contextmenu", function (d) {
                //阻止默认的右键事件
                d3.event.preventDefault();
                new commPop().showPageInfo(d.pageId);
            })
            .on("click", click);
        nodeEnter.append("circle")
            .attr("r", 9)
            .style("fill", function (d) {
                return d._children ? "lightsteelblue" : "#fff";
            });
        nodeEnter.append("text")
            .attr("dx", 0)
            .attr("dy", function (d) {
                return d.children ? -15 : 25;
            })
            .style("text-anchor", "middle")
            .text(function (d) {
                return d.name;
            });

        //step4. 原有节点更新到新位置
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        nodeUpdate.select("text")
            .attr("dy", function (d) {
                return d.children ? -15 : 25;
            })

        //step5. 折叠节点的子节点收缩回来(即是哪些children变成空的)
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + source.x + "," + source.y + ")";
            })
            .remove();
        nodeExit.select("circle")
            .attr("r", 9);
        nodeExit.select("text")
            .style("fill-opacity", 1e-6);

        //step6. 数据连接，根据目标节点的id绑定数据
        var link = svg.selectAll("path.link")
            .data(links, function (d) {
                return d.target.id;
            });

        //step7. 增加新连接
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function (d) {
                var o = {
                    x: source.x0,
                    y: source.y0
                };
                return diagonal({
                    source: o,
                    target: o
                });
            });

        //step8. 原有连接更新位置
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        //step9. 折叠的链接，收缩到源节点处
        link.exit().transition()
            .duration(duration)
            .attr("d", function (d) {
                var o = {
                    x: source.x,
                    y: source.y
                };
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .remove();
        //step10. 把旧位置存下来，用以过渡
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    //节点点击时的触发事件
    var click = function (d) {
        // 开启遮罩
        var li = layer.load(0);
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            if (d._children) {
                d.children = d._children;
                d._children = null;
            } else {


                //todo 在这里触发异步查询下级节点
                d.children = [{
                        name: "详情_" + d.pageId + "_1",
                        pageId: d.pageId + "_1",
                        pageName: "详情_" + d.pageId + "_1"
                    },
                    {
                        name: "详情_" + d.pageId + "_2",
                        pageId: d.pageId + "_2",
                        pageName: "详情_" + d.pageId + "_2"
                    },
                    {
                        name: "详情_" + d.pageId + "_3",
                        pageId: d.pageId + "_3",
                        pageName: "详情_" + d.pageId + "_3"
                    },
                    {
                        name: "详情_" + d.pageId + "_4",
                        pageId: d.pageId + "_4",
                        pageName: "详情_" + d.pageId + "_4"
                    },
                    {
                        name: "详情_" + d.pageId + "_5",
                        pageId: d.pageId + "_5",
                        pageName: "详情_" + d.pageId + "_5"
                    },
                    {
                        name: "详情_" + d.pageId + "_6",
                        pageId: d.pageId + "_6",
                        pageName: "详情_" + d.pageId + "_6"
                    },
                    {
                        name: "详情_" + d.pageId + "_7",
                        pageId: d.pageId + "_7",
                        pageName: "详情_" + d.pageId + "_7"
                    }
                ];
            }
        }

        //关闭遮罩
        setTimeout(function () {
            layer.close(li);
            // 重新渲染
            update(d);
        }, 3000);
    }

    root.x0 = width / 2;
    root.y0 = height / 2;
    update(root);
}

module.exports = drawD3Tree;