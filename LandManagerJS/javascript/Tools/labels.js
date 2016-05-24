function labels(sender, layers, expression, colors) {
    var layerDrawingOptions = [];
    for (var i = 0; i < layers.length; i++) {
        var labelClass = new esri.layers.LabelClass({
            labelExpression: expression,
            labelPlacement: "always-horizontal",
            symbol: new esri.symbol.TextSymbol({
                font: new esri.symbol.Font("6", esri.symbol.Font.STYLE_NORMAL, esri.symbol.Font.VARIANT_NORMAL, esri.symbol.Font.WEIGHT_BOLD, "Calibri"),
                color: new dojo.Color(colors[i])
            }),
            maxScale: 0,
            minScale: 2000
        });
        labelClass.labelPlacement = "esriServerPolygonPlacementAlwaysHorizontal"; //"esriServerPolygonPlacementAlwaysHorizontal"
        var layerDrawingOption = new esri.layers.LayerDrawingOptions({
            labelingInfo: [labelClass],
            showLabels: sender.checked
        });


        layerDrawingOptions[layers[i]] = layerDrawingOption;
    }
    var layer = map.getLayer('lmCore');
    map.getLayer('lmCore').setLayerDrawingOptions(layerDrawingOptions);
    //var dynlayeinfo = map.getLayer('lmCore').hasOwnProperty("dynamicLayerInfos") ? map.getLayer('lmCore').dynamicLayerInfos : map.getLayer('lmCore').layerInfos;
    //map.getLayer("lmCore").setDynamicLayerInfos(dynlayeinfo, false);
}