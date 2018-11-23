import "../../d3/d3.js";
var $ = require("jquery");

/**
 * 
 * @param {string} ele element
 * @param {array} links {source:string,target:string,remark:string},如果remark='master'，那么source节点将放大.
 */
d3.forceGuide = function (ele, links) {
    var $ele = $(ele);
    var width = $ele.width();
    var height = $ele.height();

    var nodes = {};

    links.forEach(function (link) {
        link.source = nodes[link.source] || (nodes[link.source] = {
            name: link.source,
            bigPoint: link.remark == "master",
        });
        link.target = nodes[link.target] || (nodes[link.target] = {
            name: link.target
        });
    });

    var force = d3.layout.force() //layout将json格式转化为力学图可用的格式
        .nodes(d3.values(nodes)) //设定节点数组
        .links(links) //设定连线数组
        .size([width, height]) //作用域的大小
        .linkDistance(100) //连接线长度
        .charge(-800) //顶点的电荷数。该参数决定是排斥还是吸引，数值越小越互相排斥
        .on("tick", tick) //指时间间隔，隔一段时间刷新一次画面
        .start(); //开始转换

    var svg = d3.select(ele).append("svg")
        .attr("width", width)
        .attr("height", height);

    //箭头
    var marker =
        svg.append("marker")
        .attr("id", "resolved")
        .attr("markerUnits", "userSpaceOnUse")
        .attr("viewBox", "0 0 40 20") //坐标系的区域
        .attr("refX", 40) //箭头坐标
        .attr("refY", 10)
        .attr("markerWidth", 40) //标识的大小
        .attr("markerHeight", 20)
        .attr("orient", "auto") //绘制方向，可设定为：auto（自动确认方向）和 角度值
        .attr("stroke-width", 2) //箭头宽度
        .append("path")
        .attr("d", "M2,2 L12,10 L2,18 L6,10 L2,2") //箭头的路径
        .attr('fill', '#000000'); //箭头颜色

    //设置连接线    
    var edges_line = svg.selectAll(".edgepath")
        .data(force.links())
        .enter()
        .append("path")
        .attr({
            'd': function (d) {
                return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y
            },
            'class': 'edgepath',
            'id': function (d, i) {
                return 'edgepath' + i;
            }
        })
        .style("stroke", function (d) {
            var lineColor;
            //根据关系的不同设置线条颜色
            if (d.remark == "master") {
                lineColor = "#B43232";
            } else {
                lineColor = "#A254A2";
            }
            return lineColor;
        })
        .style("pointer-events", "none")
        .style("stroke-width", 0.5) //线条粗细
        .attr("marker-end", "url(#resolved)"); //根据箭头标记的id号标记箭头

    var edges_text = svg.append("g").selectAll(".edgelabel")
        .data(force.links())
        .enter()
        .append("text")
        .style("pointer-events", "none")
        .attr({
            'class': 'edgelabel',
            'id': function (d, i) {
                return 'edgepath' + i;
            },
            'dx': 50,
            'dy': 0
        });

    //设置线条上的文字
    edges_text.append('textPath')
        .attr('xlink:href', function (d, i) {
            return '#edgepath' + i
        })
        .style("pointer-events", "none")
        .text(function (d) {
            if (d.remark == "master") {
                return "";
            } else {
                return d.remark;
            }
        });

    //圆圈
    var circle = svg.append("g").selectAll("circle")
        .data(force.nodes()) //表示使用force.nodes数据
        .enter().append("circle")
        .style("fill", function (node) {
            var color; //圆圈背景色
            if (node.bigPoint) {
                color = "#F6E8E9";
            } else {
                color = "#F9EBF9";
            }
            return color;
        })
        .style('stroke', function (node) {
            var color; //圆圈线条的颜色
            if (node.bigPoint) {
                color = "#B43232";
            } else {
                color = "#A254A2";
            }
            return color;
        })
        .attr("r", 28) //设置圆圈半径
        .on("click", function (node) {
            //单击时让连接线加粗
            edges_line.style("stroke-width", function (line) {
                if (line.source.name == node.name || line.target.name == node.name) {
                    return 2;
                } else {
                    return 0.5;
                }
            });
        })
        .call(force.drag); //将当前选中的元素传到drag函数中，使顶点可以被拖动

    //圆圈的提示文字
    circle.append("svg:title")
        .text(function (node) {
            if (node.bigPoint) {
                return "主节点"
            }
        });

    var text = svg.append("g").selectAll("text")
        .data(force.nodes())
        //返回缺失元素的占位对象（placeholder），指向绑定的数据中比选定元素集多出的一部分元素。
        .enter()
        .append("text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle") //在圆圈中加上数据  
        .style('fill', function (node) {
            var color; //文字颜色
            if (node.bigPoint) {
                color = "#B43232";
            } else {
                color = "#A254A2";
            }
            return color;
        }).attr('x', function (d) {
            // console.log(d.name+"---"+ d.name.length);
            var re_en = /[a-zA-Z]+/g;
            //如果是全英文，不换行
            if (d.name.match(re_en)) {
                d3.select(this).append('tspan')
                    .attr('x', 0)
                    .attr('y', 2)
                    .text(function () {
                        return d.name;
                    });
            }
            //如果小于四个字符，不换行
            else if (d.name.length <= 4) {
                d3.select(this).append('tspan')
                    .attr('x', 0)
                    .attr('y', 2)
                    .text(function () {
                        return d.name;
                    });
            } else {
                var top = d.name.substring(0, 4);
                var bot = d.name.substring(4, d.name.length);

                d3.select(this).text(function () {
                    return '';
                });

                d3.select(this).append('tspan')
                    .attr('x', 0)
                    .attr('y', -7)
                    .text(function () {
                        return top;
                    });

                d3.select(this).append('tspan')
                    .attr('x', 0)
                    .attr('y', 10)
                    .text(function () {
                        return bot;
                    });
            }
        });

    function tick() {
        //path.attr("d", linkArc);//连接线
        circle.attr("transform", transform1); //圆圈
        text.attr("transform", transform2); //顶点文字


        edges_line.attr('d', function (d) {
            var path = 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
            return path;
        });

        edges_text.attr('transform', function (d, i) {
            if (d.target.x < d.source.x) {
                var bbox = this.getBBox();
                var rx = bbox.x + bbox.width / 2;
                var ry = bbox.y + bbox.height / 2;
                return 'rotate(180 ' + rx + ' ' + ry + ')';
            } else {
                return 'rotate(0)';
            }
        });
    }

    //设置连接线的坐标,使用椭圆弧路径段双向编码
    function linkArc(d) {
        return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y
    }
    //设置圆圈和文字的坐标
    function transform1(d) {
        return "translate(" + d.x + "," + d.y + ")";
    }

    function transform2(d) {
        return "translate(" + (d.x) + "," + d.y + ")";
    }

    return this;

}