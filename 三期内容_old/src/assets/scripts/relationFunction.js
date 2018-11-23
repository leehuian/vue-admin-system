var drawRelationFunc = function (myVue) {
    var self = this;
    self.myVue = myVue;
    self.containerID = "#container";
    self.sourceData = {}; //源数据
    self.allRestFuncidList = []; //选择的功能所具有的所有funcid对象集合
    self.inFunctionList = []; //所有输入功能的对象集合
    self.outFunctionList = []; //所有的输出功能的对象集合
    self.allRestFuncidMap = {};
    self.inFunctionMap = {};
    self.outFunctionMap = {};
    self.fidHeight = 0;

    self.funcidInMap = {}; //功能与funcid之间的映射关系
    self.funcidOutMap = {};
    self.inLines = []; //所有的输入连接线集合
    self.outLines = []; //所有的输出连接线集合
    self.color = d3.scale.category20();

    var windowContainerWidth = document.getElementById("container").offsetWidth - 50;
    var TopoShape = {
        svg_width: (windowContainerWidth / 2 > 600 ? windowContainerWidth / 2 : 600) - 10, //svg的宽度
        svg_height: 450,
        svg_padding: 100,
        node_padding: 20,
        node_width: 100,
        node_height: 36,
        window_padding: 20,
        function_width: 40,
        function_height: 40,
        function_padding: 30,
        function_node_padding: 100
    }

    /**
     * 清除旧的svg画面
     */
    self.clearOld = function () {
        d3.select(self.containerID).selectAll('svg').remove();
        d3.select(self.containerID).selectAll('div').remove();
    }

    /**
     * 计算所有funcid节点位置、功能节点位置
     */
    self.computePoints = function () {
        self.allRestFuncidList = self.sourceData.allRestFuncidList;
        var fidLen = self.allRestFuncidList.length;
        var fidHeight = fidLen * (TopoShape.node_height + TopoShape.node_padding) - TopoShape.node_padding;
        self.fidHeight = fidHeight;
        self.inFunctionList = self.sourceData.inFunctionList;
        self.outFunctionList = self.sourceData.outFunctionList;
        var functionLen1 = self.inFunctionList.length;
        var functionLen2 = self.outFunctionList.length;
        var functionHeight1 = functionLen1 * (TopoShape.function_height + TopoShape.function_padding) - TopoShape.function_padding;
        var functionHeight2 = functionLen2 * (TopoShape.function_height + TopoShape.function_padding) - TopoShape.function_padding;
        var functionHeight = functionHeight1 > functionHeight2 ? functionHeight1 : functionHeight2;
        var maxHeight = functionHeight > fidHeight ? functionHeight : fidHeight;
        //计算svg的最大高度。
        if ((maxHeight + TopoShape.svg_padding * 2) > TopoShape.svg_height) {
            TopoShape.svg_height = maxHeight + TopoShape.svg_padding * 2;
        }

        //计算每个funcid的位置
        for (var i = 0; i < self.allRestFuncidList.length; i++) {
            var funcidObj = self.allRestFuncidList[i];
            funcidObj.x = TopoShape.svg_width / 2 - TopoShape.node_width / 2;
            funcidObj.y = i * (TopoShape.node_height + TopoShape.node_padding) + (TopoShape.svg_height - fidHeight) / 2;
            self.allRestFuncidMap[funcidObj.funcId] = funcidObj;
        }
        //计算每个输入功能的位置
        for (var i = 0; i < self.inFunctionList.length; i++) {
            var functionObj = self.inFunctionList[i];
            functionObj.x = TopoShape.svg_width / 2 - TopoShape.node_width / 2 - TopoShape.function_node_padding - TopoShape.function_width;
            functionObj.y = i * (TopoShape.function_height + TopoShape.function_padding) + (TopoShape.svg_height - functionHeight1) / 2;
            self.inFunctionMap[functionObj.functionId] = functionObj;
        }
        //计算每个输出功能的位置
        for (var i = 0; i < self.outFunctionList.length; i++) {
            var functionObj = self.outFunctionList[i];
            functionObj.x = TopoShape.svg_width / 2 + TopoShape.node_width / 2 + TopoShape.function_node_padding;
            functionObj.y = i * (TopoShape.function_height + TopoShape.function_padding) + (TopoShape.svg_height - functionHeight2) / 2;
            self.outFunctionMap[functionObj.functionId] = functionObj;
        }
    }

    /**
     * 计算所有连接线
     */
    self.computeLines = function () {
        self.funcidInMap = self.sourceData.funcidInMap;
        self.funcidOutMap = self.sourceData.funcidOutMap;
        //输入连接线
        for (var inFuncid in self.funcidInMap) {
            var inGongNengList = self.funcidInMap[inFuncid];
            for (var i = 0; i < inGongNengList.length; i++) {
                var gnId = inGongNengList[i];
                if (!self.allRestFuncidMap[inFuncid]) {
                    debugger;
                }
                self.inLines.push({
                    "begin": self.inFunctionMap[gnId],
                    "end": self.allRestFuncidMap[inFuncid]
                })
            }
        }
        //输出连接线
        for (var outFuncid in self.funcidOutMap) {
            var outGongNengList = self.funcidOutMap[outFuncid];
            for (var i = 0; i < outGongNengList.length; i++) {
                var gnId = outGongNengList[i];
                self.outLines.push({
                    "begin": self.allRestFuncidMap[outFuncid],
                    "end": self.outFunctionMap[gnId]
                })
            }
        }
    }

    /**
     * 画Svg画布
     */
    self.drawSvg = function () {
        d3.select(self.containerID).selectAll('svg').remove();
        self.svg = d3.select(self.containerID).append('svg')
            .attr("width", TopoShape.svg_width)
            .attr("height", TopoShape.svg_height)
            .style({
                "border": "1px solid #e1e1e1",
                "background-color": "#eee",
                "margin-right": "20px"
            })
            .on('click', function () {
                d3.select(self.containerID).selectAll('div').remove();
            })
    }

    /**
     * 画该功能下的funcid节点和关联功能节点
     */
    self.drawFidAndGongNeng = function () {
        var fidWin = self.svg.append('g')
            .attr('class', 'relation-window')
            .attr("transform", function (d) {
                var x = TopoShape.svg_width / 2 - TopoShape.node_width / 2 - TopoShape.window_padding;
                var y = TopoShape.svg_height / 2 - self.fidHeight / 2 - TopoShape.window_padding;
                return "translate(" + x + "," + y + ")";
            })
        fidWin.append('rect')
            .attr("height", self.fidHeight + TopoShape.window_padding * 2)
            .attr("width", TopoShape.node_width + TopoShape.window_padding * 2)
            .style("fill", self.color(self.sourceData.selfFunction.functionName.replace(/ .*/, "")))
            .style("stroke", "#565656");
        fidWin.append('text')
            .attr('x', TopoShape.node_width / 2 + TopoShape.window_padding)
            .attr('y', -20)
            .style({
                "font-size": "18px",
                "font-weight": 600
            })
            .attr("text-anchor", "middle")
            .text(function (d) {
                return self.sourceData.selfFunction.functionName;
            })

        var fidNode = self.svg.selectAll('g.relation-fid')
            .data(self.allRestFuncidList)
            .enter().append('g')
            .attr('class', 'relation-fid')
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })

        fidNode.append("rect")
            .attr("height", TopoShape.node_height)
            .attr("width", TopoShape.node_width)
            .style("fill", "#ecf4fd")
            .style("stroke", "#cae4ff")
            .append("title")
            .text(function (d) {
                return d.funcId;
            });
        fidNode.append('text')
            .attr("x", TopoShape.node_width / 2)
            .attr("y", TopoShape.node_height / 2)
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .attr("transform", null)
            .text(function (d) {
                return d.name;
            })

        var gnList = self.inFunctionList.concat(self.outFunctionList);
        var gongNengNode = self.svg.selectAll('g.relation-gn')
            .data(gnList)
            .enter().append('g')
            .attr('class', 'relation-gn')
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })


        gongNengNode.append('circle')
            .attr('cx', TopoShape.function_width / 2)
            .attr('cy', TopoShape.function_height / 2)
            .attr('r', TopoShape.function_width / 2)
            .attr('fill', function (d) {
                return self.color(d.functionName.replace(/ .*/, ""))
            })
            .on('dblclick', function (d) {
                console.log(d);
                self.showGongNendDetail(d);
            })
            .append("title")
            .text(function (d) {
                return d.functionId;
            })

        gongNengNode.append('text')
            .attr("x", TopoShape.function_width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .attr("transform", null)
            .text(function (d) {
                return d.functionName;
            })

        self.svg.selectAll('circle').call(self.dragmove);
    }

    /**
     * 画箭头
     */
    self.drawJiantou = function () {
        self.svg.selectAll('defs').remove();
        var defs = self.svg.append("defs");
        var arrowMarker = defs.append("marker")
            .attr("id", "arrow")
            .attr("markerUnits", "strokeWidth")
            .attr("markerWidth", "12")
            .attr("markerHeight", "12")
            .attr("viewBox", "0 0 12 12")
            .attr("refX", "9")
            .attr("refY", "6")
            .attr("orient", "auto");
        var arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";
        arrowMarker.append("path")
            .attr("d", arrow_path)
            .attr("fill", "#000");
    }

    /**
     * 画连接线
     */
    self.drawLine = function () {
        var inLine = self.svg.selectAll('line.relation-inline')
            .data(self.inLines)
            .enter().append('line')
            .attr('class', 'relation-inline')
            .attr('x1', function (d) {
                return d.begin.x + TopoShape.function_width;
            })
            .attr('y1', function (d) {
                return d.begin.y + TopoShape.function_height / 2;
            })
            .attr('x2', function (d) {
                return d.end.x;
            })
            .attr('y2', function (d) {
                return d.end.y + TopoShape.node_height / 2;
            })

        var outLine = self.svg.selectAll('line.relation-outline')
            .data(self.outLines)
            .enter().append('line')
            .attr('class', 'relation-outline')
            .attr('x1', function (d) {
                return d.begin.x + TopoShape.node_width;
            })
            .attr('y1', function (d) {
                return d.begin.y + TopoShape.node_height / 2;
            })
            .attr('x2', function (d) {
                return d.end.x;
            })
            .attr('y2', function (d) {
                return d.end.y + TopoShape.function_height / 2;
            })

        self.svg.selectAll('line')
            .style('stroke', "#000")
            .attr("stroke-width", 2)
            .style('fill', "none")
            .attr("marker-end", "url(#arrow)");
    }

    self.showGongNendDetail = function (obj) {
        if (self.contentBody) {
            //首先清空页面中的查询详情信息的div
            self.contentBody.selectAll('div').remove();
        } else {
            self.contentBody = d3.select(self.containerID);
        }

        var content = self.contentBody.append('div');

        var cls = "querFuncidInfo find-div-body-";
        if ((obj.x + TopoShape.function_width + 350) > TopoShape.svg_width) {
            cls = cls + "left";
            content.attr('class', cls)
                .style({
                    'top': obj.y + TopoShape.function_height / 2 - 15 + "px",
                    'left': obj.x - 350 - 8 + "px",
                    'width': 350 + "px"
                })
        } else {
            cls = cls + "right";
            content.attr('class', cls)
                .style({
                    'top': obj.y + TopoShape.function_height / 2 - 15 + "px",
                    'left': obj.x + TopoShape.function_width + 8 + "px",
                    'width': 350 + "px"
                })
        }

        //添加文字标题
        content.append('div')
            .attr('class', 'content-title')
            .text(obj.functionName);

        //添加functionid
        var attr1 = content.append('div')
            .attr('class', 'content-attr')
        attr1.append('div')
            .text('functionId');
        attr1.append('div')
            .text(obj.functionId);

        //添加业务
        var attr2 = content.append('div')
            .attr('class', 'content-attr')
        attr2.append('div')
            .text('业务');
        attr2.append('div')
            .text(obj.bizName);

        //添加所属模块
        var attr3 = content.append('div')
            .attr('class', 'content-attr')
        attr3.append('div')
            .text('模块');
        attr3.append('div')
            .text(obj.moduleName);

        //添加备注信息
        var attr4 = content.append('div')
            .attr('class', 'content-attr')
        attr4.append('div')
            .text('包含页面');
        attr4.append('div')
            .style("word-break", "break-word")
            .text(obj.funcids.split('|').join(" ， "));
    }

    /**
     * 定义圆形的功能节点拖拽行为
     * @param {Object} d 
     */
    self.dragmove = d3.behavior.drag()
        .on("drag", function (d) {
            //默认鼠标的位置就是节点圆心的位置，然后通过圆形计算出该节点的x,y的位置
            //因为每个圆形是一个单独的坐标系，所有的连接线是一个单独的坐标系。
            //所以在移动连接线的时候，需要进行一个转换，这样子才可以
            var jiangeCx = d3.event.x - d3.select(this).attr('cx');
            var jiangeCy = d3.event.y - d3.select(this).attr('cy');
            //如果x轴超出了画布的范围，直接返回
            if ((d.x + jiangeCx) < TopoShape.function_width || (d.x + jiangeCx) > (TopoShape.svg_width - TopoShape.function_width)) {
                return false;
            }
            //如果y轴超出了画布的范围，直接返回
            if ((d.y + jiangeCy) < TopoShape.function_height || (d.y + jiangeCy) > (TopoShape.svg_height - TopoShape.function_height)) {
                return false;
            }
            d.x = d.x + jiangeCx;
            d.y = d.y + jiangeCy;
            //移动圆点
            d3.select(this)
                .attr({
                    'cx': d3.event.x,
                    'cy': d3.event.y
                })

            //移动功能名称文字
            self.svg.selectAll('text')
                .filter(function (t) {
                    return t === d;
                })
                .attr("x", d3.event.x)
                .attr("y", d3.event.y - TopoShape.function_height / 2 - 10)


            //移动连接线
            self.svg.selectAll('line.relation-inline')
                .filter(function (l) {
                    return l.begin == d
                })
                .attr({
                    "x1": d.x + TopoShape.function_width,
                    "y1": d.y + TopoShape.function_height / 2
                })
            self.svg.selectAll('line.relation-outline')
                .filter(function (l) {
                    return l.end == d
                })
                .attr({
                    "x2": d.x,
                    "y2": d.y + TopoShape.function_height / 2
                })


        })

    /**
     * 画力导向图
     */
    self.drawDaoXiangTu = function () {
        var nodes = [];
        var edges = [];
        var allDaoXiangTuNodeMap = {};
        nodes.push({
            "name": self.sourceData.selfFunction.functionName
        });
        for (var i in self.inFunctionMap) {
            allDaoXiangTuNodeMap[i] = self.inFunctionMap[i];
        }
        for (var i in self.outFunctionMap) {
            allDaoXiangTuNodeMap[i] = self.outFunctionMap[i];
        }
        for (var i in allDaoXiangTuNodeMap) {
            nodes.push({
                "name": allDaoXiangTuNodeMap[i].functionName
            })
            edges.push({
                source: 0,
                target: nodes.length - 1
            })
        }
        var daoxiangtuSvg = d3.select(self.containerID)
            .append("svg")
            .attr({
                'width': TopoShape.svg_width,
                'height': TopoShape.svg_height
            })
            .style({
                "border": "1px solid #e1e1e1",
                "background-color": "#eee"
            })

        //定义力导向图的布局
        var force = d3.layout.force()
            .nodes(nodes) //指定节点数组
            .links(edges) //指定连线数组
            .size([TopoShape.svg_width, TopoShape.svg_height]) //指定范围
            .linkDistance(150) //指定连线长度
            .charge(-400); //相互之间的作用力

        force.start(); //开始作用

        //添加连线     
        var svg_edges = daoxiangtuSvg.selectAll("line")
            .data(edges)
            .enter()
            .append("line")
            .style("stroke", "#ccc")
            .style("stroke-width", 1);

        //添加节点         
        var svg_nodes = daoxiangtuSvg.selectAll("circle")
            .data(nodes)
            .enter()
            .append("circle")
            .attr("r", 20)
            .style("fill", function (d, i) {
                return self.color(d.name.replace(/ .*/, ""))
            })
            .call(force.drag); //调用 call( force.drag ) 后节点可被拖动。force.drag() 是一个函数，将其作为 call() 的参数，相当于将当前选择的元素传到 force.drag() 函数中

        //添加描述节点的文字
        var svg_texts = daoxiangtuSvg.selectAll("text")
            .data(nodes)
            .enter()
            .append("text")
            .style("fill", "black")
            .attr("dx", 25)
            .attr("dy", 8)
            .text(function (d) {
                return d.name;
            });

        //力导向图是不断运动的，每一时刻都在发生更新，因此，必须不断更新节点和连线的位置。
        //力导向图布局 force 有一个事件 tick，每进行到一个时刻，都要调用它，更新的内容就写在它的监听器中
        force.on("tick", function () { //对于每一个时间间隔

            //更新连线坐标
            svg_edges.attr("x1", function (d) {
                    return d.source.x;
                })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return d.target.x;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                });

            //更新节点坐标
            svg_nodes.attr("cx", function (d) {
                    return d.x;
                })
                .attr("cy", function (d) {
                    return d.y;
                });

            //更新文字坐标
            svg_texts.attr("x", function (d) {
                    return d.x;
                })
                .attr("y", function (d) {
                    return d.y;
                });
        })
    }

    /**
     * 画功能关联关系
     */
    self.drawRelation = function (sourceData) {
        self.sourceData = sourceData;
        self.computePoints();
        self.computeLines();
        self.drawSvg();
        self.drawJiantou();
        self.drawFidAndGongNeng();
        self.drawLine();
        self.drawDaoXiangTu();

    }
}

module.exports = drawRelationFunc;