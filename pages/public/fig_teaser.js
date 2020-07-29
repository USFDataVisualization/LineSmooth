
    function append_text( grp, x, y, text, align='start', font_variant='normal' ){
                 grp.append("text")
                  .style("fill", "gray")
                  .style("font-size", "18px")
                  .attr("dy", ".35em")
                  .attr("font-family", "Arial")
                  .attr("font-variant", font_variant)
                  .attr("text-anchor", align)
                  .attr("transform", "translate("+ x +","+ y +")")
                  .text( text );
    }

    function append_text_teaser( grp, x, y, text, align='start', font_variant='normal' ){
                 grp.append("text")
                  .style("fill", "gray")
                  .style("font-size", "24px")
                  .attr("dy", ".35em")
                  .attr("font-family", "Arial")
                  .attr("font-variant", font_variant)
                  .attr("text-anchor", align)
                  .attr("transform", "translate("+ x +","+ y +")")
                  .text( text );
    }


function load_teaser(){

    var dset = 'dataset=eeg_500&datafile=eeg_chan10_500';

    var filter_levels = { "median": 0.85, "min": 0.44, "max": 0.5,
                          "gaussian": 0.625, "savitzky_golay": 0.15, "mean": 0.41,
                          "cutoff": 0.915, "butterworth": 0.64, "chebyshev": 0.923,
                          "subsample": 0.91, "tda": 0.79, "rdp": 0.765 };

    function stringize( v ){
        if( v == 'nan' ) return 'NaN';
        return v.toFixed(3);
    }

    let rank_order = [ {'title': 'RV / DR', 'subcats':['L1 norm', 'Linf norm'] },
                       {'title': 'CDV', 'subcats':['delta volume']},
                       {'title': 'FE / FA', 'subcats':['peak wasserstein','peak bottleneck']},
                       {'title': 'CD / CT', 'subcats':['frequency preservation']},
                       {'title': 'S / CP', 'subcats':['pearson cc', 'spearman rc']} ]



    let lineGenerator = d3.line().curve(d3.curveCardinal);

    function find_links( inst0, inst1 ){
        res = []
        inst0.forEach( function(i0){
            i1 = inst1.find( function(t){
                return t.path_class == i0.path_class;
            });
            res.push( {'src':i0,'dst':i1} );
        });
        return res;
    }

    function make_path( start, end ){
        return lineGenerator([start,
                    [start[0]+(end[0]-start[0])/3, start[1]+(end[1]-start[1])/8],
                    [end[0]-(end[0]-start[0])/3, end[1]-(end[1]-start[1])/8],
                    end]);
    }


    function draw_path(svg, links){
        console.log(links)
        svg.append("g").selectAll("path")
            .data(links)
            .enter().append("path")
            .attr( 'd', function(d){ return make_path( [d.src.x+15,d.src.y+7.5], [d.dst.x,d.dst.y+7.5] ); } )
            //.attr("class", function(d){ return d.src.class + "_filter_light"; })
            .attr("class", function(d){ console.log(d.src.path_class ); return d.src.path_class; })
            .attr("fill-opacity", 0.7)
            .attr("fill", "none")
            .attr("stroke-width",4);
    }


    function draw_ranks( svg, teaser_ranks ){


        let top_3 = new Set();
        metric_names.forEach( function(n){
            teaser_ranks[n].sort( function(a,b){ if(a.value<b.value) return -1; if(a.value>b.value) return 1; return 0; });
            for( i = 0; i < teaser_ranks[n].length; i++ ){
                teaser_ranks[n][i].rank = i+1;
            }

            r = teaser_ranks[n];
            r.forEach( function(f){
                if(f.rank <= 3 ){ top_3.add(f.class); }
            });
        });


        startY = 348;
        dY = 27;

        curX = 33;
        last_rank = null;
        links = [];
        line_classes = ['tda','gaussian','savitzky_golay','cutoff','rdp','subsample'];
        rank_order.forEach( function(rg){
            rg.subcats.forEach( function(n){
                //console.log(teaser_ranks[n]);
                        //teaser_ranks[n].sort( function(a,b){ if(a.value<b.value) return -1; if(a.value>b.value) return 1; return 0; });
                        curY = startY;
                        for( i = 0; i < teaser_ranks[n].length; i++ ){
                            if( line_classes.includes(teaser_ranks[n][i].class) ){
                                teaser_ranks[n][i].path_class = teaser_ranks[n][i].class + "_track2";
                            }
                            else{
                                teaser_ranks[n][i].path_class = teaser_ranks[n][i].class + "_hollow";
                            }
                            //teaser_ranks[n][i].rank = i+1;
                            //if(!top_3.has(teaser_ranks[n][i].class))
                            if( teaser_ranks[n][i].rank > 3 )
                                teaser_ranks[n][i].class += "_hollow";


                            teaser_ranks[n][i].x = curX;
                            teaser_ranks[n][i].y = curY;
                            teaser_ranks[n][i].r = 20;
                            curY += dY;
                        }
                        curX += 33;
                        if( last_rank != null )
                            links = links.concat( find_links( last_rank,teaser_ranks[n]) );
                        last_rank = teaser_ranks[n];

            });
            curX += 24;
        });

        draw_path(svg, links);


        metric_names.forEach( function(n){
            svg.append("g").selectAll("rect")
                .data(teaser_ranks[n])
                .enter().append("rect")
                            .attr("x", function(d){ return d.x+(15-d.r)/2; } )
                            .attr("y", function(d){ return d.y+(15-d.r)/2; } )
                            .attr("class", function(d){ return d.class + "_filter"; })
                            .attr("width", function(d){ return d.r; })
                            .attr("height", function(d){ return d.r; });

        });

        let g_text = svg.append("g");

        curY = startY+8;
        for( i = 0; i < last_rank.length; i++ ){
            let txt = filter_short_names[ last_rank[i].class ];
            if (txt[0] == txt[0].toLowerCase()) curY -= 2;
            append_text_teaser( g_text, 384, curY, filter_short_names[ last_rank[i].class ], 'start', 'small-caps' );
            if (txt[0] == txt[0].toLowerCase()) curY += 2;
            append_text_teaser( g_text, 24, curY, (i+1), 'end', 'start', 'small-caps' );
            curY += dY;
        }

        curX = 44;
        rank_order.forEach( function(rg){
            g_text.append("text")
                  .style("fill", "gray")
                  .style("font-size", "24px")
                  //.attr("dy", ".35em")
                  .attr("font-family", "Arial")
                  .attr("text-anchor", "start")
                  .attr("transform", "translate("+ (curX+(rg.subcats.length-1)*10) +","+ (337) +") rotate(330)")
                  .text( rg['title'] );

            rg.subcats.forEach( function(n){
                if( n=="peak wasserstein") curX += 2;
                if( n=="peak bottleneck") curX += 6;
                g_text.append("text")
                      .style("fill", "gray")
                      .style("font-size", "20px")
                      //.attr("dy", ".35em")
                      .attr("font-family", "Arial")
                      .attr("text-anchor", "middle")
                      .attr("transform", "translate("+ (curX-2) +","+ (681) +")")
                      .text( metric_math_name[n][0] )
                        .append("tspan")
                            .attr("dy","4")
                            .text(metric_math_name[n][1]);
                if( n=="peak wasserstein") curX -= 2;
                 if( n=="peak bottleneck") curX -= 6;
                curX += 33;
            });
            curX += 24;
        });


    }

	function load_dataset( idx, f, f_level ){

        if( typeof load_dataset.counter == 'undefined' ) {
            load_dataset.counter = 0;
        }

        if( typeof load_dataset.teaser_ranks == 'undefined' ){
            load_dataset.teaser_ranks = {};
            metric_names.forEach( function(n){
                load_dataset.teaser_ranks[n] = [];
            });
        }



        var teaser_svg = d3.select("#fig_teaser");
        var text_group = teaser_svg.append("g");


        d3.json( "data?" + dset + "&filter=" + f + "&level=" + f_level, function( dinput ) {
            let i = Math.floor(idx/3);
            let j = idx%3;

            metric_names.forEach( function(n){
                load_dataset.teaser_ranks[n].push( {'class':f, 'rank': 1, 'value': dinput.metrics[n]});
            });

            if( i == 0 && j == 0 ){
                add_linechart( "#fig_teaser", dinput['input'], dinput['input'], [5,10], [530,245], "dataset_fig_lines" );
            }

            add_linechart( "#fig_teaser", dinput['input'], dinput['output'], [590+375*j,5+180*i], [350,150], f + "_fig_filter" );
            //append_text( text_group, (5+335*i+15), (5+155*j+125), "approx entropy: " + dinput['metrics']['approx entropy'].toFixed(3) );
            append_text_teaser( text_group, (590+375*j+15), (5+180*i+10), filter_long_names[f], 'start', 'small-caps' );

            if( ++load_dataset.counter == 12 ){
                draw_ranks(teaser_svg, load_dataset.teaser_ranks);
            }

        });

	}


	$('#fig_teaser').empty();

    let idx = 0;
    filter_list.forEach( function(key){
        load_dataset(idx, key, filter_levels[key]);
        idx++;
    });


/*
    metric_names.forEach( function(n){
        x = teaser_ranks[n];
        console.log(x);
        x.forEach( function(d){
            console.log(d);
        });



        console.log( typeof(y));
        /*
        for( i = 0; i < ranks[n].length; i++ ){
            //avg_ranks[ranks[n][i].class] += i+1;
            ranks[n][i].rank = i+1;
        }*/
  //  });
    //console.log(ranks);




 }

 function load_datasets_fig(){
    let dsets = [{"dataset":"chi_homicide", "datafile": "chi_homicide_weekly", "title": "Chicago Weekly Homicides"},
                 {"dataset":"nz_tourist", "datafile": "nz_tourist_monthly", "title": "New Zealand Monthly Tourists"},
                 {"dataset":"chi_homicide", "datafile": "chi_homicide_monthly", "title": "Chicago Monthly Homicides"},
                 {"dataset":"nz_tourist", "datafile": "nz_tourist_annually", "title": "New Zealand Annual Tourists"},
                 {"dataset":"eeg_10000", "datafile": "eeg_chan10_10000", "title": "EEG Chan 10 (10k samples)"},
                 {"dataset":"flights", "datafile": "flights_daily", "title": "US Daily Domestic Flights"},
                 {"dataset":"eeg_2500", "datafile": "eeg_chan10_2500", "title": "EEG Chan 10 (2.5k samples)"},
                 {"dataset":"flights", "datafile": "flights_weekly", "title": "US Weekly Domestic Flights"},
                 {"dataset":"eeg_500", "datafile": "eeg_chan10_500", "title": "EEG Chan 10 (500 samples)"},
                 {"dataset":"flights", "datafile": "flights_monthly", "title": "US Monthly Domestic Flights"},
                 {"dataset":"stock_price", "datafile": "stock_bac_price", "title": "Daily Stock Closing Price (BAC)"},
                 {"dataset":"unemployment", "datafile": "unemployment_ag", "title": "US Monthly Unemployment (Agriculture)"},
                 {"dataset":"stock_volume", "datafile": "stock_bac_volume", "title": "Daily Stock Volume (BAC)"},
                 {"dataset":"unemployment", "datafile": "unemployment_info", "title": "US Monthly Unemployment (InfoTech)"},
                 {"dataset":"climate_awnd", "datafile": "climate_lax_awnd", "title": "Daily Avg Wind Speed (LAX)"},
                 {"dataset":"astro", "datafile": "astro_115_128", "title": "Radio Astronomy 115/128"},
                 {"dataset":"climate_tmax", "datafile": "climate_jfk_tmax", "title": "Daily High Temperature (JFK)"},
                 {"dataset":"astro", "datafile": "astro_116_134", "title": "Radio Astronomy 116/134"},
                 {"dataset":"climate_prcp", "datafile": "climate_sea_prcp", "title": "Daily Total Precipitation (SEA)"},
                 null];

	function load_dataset( idx, ds ){
	    if( ds == null ) return;
        var teaser_svg = d3.select("#fig_datasets");
        var text_group = teaser_svg.append("g");

        d3.json( "data?dataset=" + ds['dataset'] + "&datafile=" + ds['datafile'] + "&filter=median&level=0", function( dinput ) {
            let i = Math.floor(idx/2);
            let j = idx%2;

            if( idx == 15 || idx == 17 ) i += 0.5;

            if( idx >= 10 ){ i -= 5; j += 2.0; }
            if( i >= 2 ) i += 0.1;
            j *= 1.25;

            add_linechart( "#fig_datasets", dinput['input'], dinput['input'], [5+365*i,10+155*j], [340,153], "dataset_fig_lines" );
            //append_text( text_group, (5+335*i+15), (5+155*j+125), "approx entropy: " + dinput['metrics']['approx entropy'].toFixed(3) );
            append_text( text_group, (5+365*i+15), (5+155*j+5), ds['title'] );

        });

	}



	$('#fig_datasets').empty();

    let idx = 0;
    dsets.forEach( function(ds){
        load_dataset(idx, ds);
        idx++;
    });


 }


class SVG_Plot {
    constructor(doc_id){
        this.doc_id = doc_id;

        this.svg = d3.select(doc_id);
        this.margin = {left: 45, right: 7, top: 5, bottom: 20};
        this.axis_font_size = "10px";
    }

    clear(){
        $(this.doc_id).empty();

        this.svg_width  = +this.svg.attr("width");
        this.svg_height = +this.svg.attr("height");

        this.plot_width  = this.svg_width  - this.margin.left - this.margin.right;
        this.plot_height = this.svg_height - this.margin.top  - this.margin.bottom;

        this.defs = this.svg.append("defs");
    }

    update_axes( data, func_x, func_y ){
        let xTmp = d3.extent( data, func_x );
        this.xExt = [ 0, Math.max(0,xTmp[1]) ];
        this.xAxis = d3.scaleLinear().domain( this.xExt ).range([ 0, this.plot_width ]);

        let yTmp = d3.extent( data, func_y );
        this.yExt = [ 0, fix_range(Math.max(0, yTmp[1])) ];
        this.yAxis = d3.scaleLinear().domain( this.yExt ).range([ this.plot_height, 0]);
    }

    add_pattern( id, w, h, data ){
        this.defs.append("pattern")
                .attr("id", id)
                .attr("patternUnits", "userSpaceOnUse")
                .attr("width", w).attr("height", h)
                .append("image")
                    .attr("xlink:href", data)
                    .attr("x", "0").attr("y", "0")
                    .attr("width", w).attr("height", h);
    }

    add_axes(hideTextX = false, hideTextY = false, rotX = 0){
        let resX = null;
        if( (this.yExt[1]-this.yExt[0]) < 0.1 || (this.yExt[1]-this.yExt[0]) > 10000 ){
            resX = this.svg.append("g")
                    .style("font-size", this.axis_font_size)
                    .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
                    .call(d3.axisLeft(this.yAxis).ticks(5).tickFormat(d3.format(".1e")));
        }
        else{
            resX = this.svg.append("g")
                .style("font-size", this.axis_font_size)
                .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
                .call(d3.axisLeft(this.yAxis).ticks(5));
        }

        let resY = this.svg.append("g")
                    .style("font-size", this.axis_font_size)
                    .attr("transform", "translate(" + this.margin.left + "," + (this.plot_height+this.margin.top) + ")")
                    .call(d3.axisBottom(this.xAxis).ticks(5));


        if( hideTextX ){
            resX.selectAll("text").text("");
        }
        if( hideTextY ){
            resY.selectAll("text").text("");
        }
        if( rotX != 0 ){
                resX.selectAll("text")
                    .attr("y", "-2px")
                    .attr("y", "-6px")
                    .attr("transform", "rotate(" + rotX.toString() + ")")
                    .style("text-anchor", "end" );
        }
    }

    add_points( data, func_x, func_y, func_r, func_class ){
        var xAxis = this.xAxis, yAxis = this.yAxis;
        this.svg.append('g')
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
              .attr("cx", function (d) { return xAxis(func_x(d)); } )
              .attr("cy", function (d) { return yAxis(func_y(d)); } )
              .attr("r", func_r )
              .attr("class", func_class );
    }

    add_clippath( ){
        this.svg.append("clipPath")
                    .attr("id", "boxclip")
                    .append("rect")
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr("width", this.plot_width)
                        .attr("height", this.plot_height);
    }

    add_path( data, func_x, func_y, func_class ){
        var xAxis = this.xAxis, yAxis = this.yAxis;
        this.svg.append('g')
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
            .append("path")
                .datum( data )
                    .attr("clip-path", "url(#boxclip)")
                    .attr("class", func_class )
                    .attr("d", d3.line()
                        .x(function(d) { return xAxis(func_x(d)); })
                        .y(function(d) { return yAxis(func_y(d)); })
                    );

    }


    add_pattern_area( data, func_x, func_y, pattern_name ){
        var xAxis = this.xAxis, yAxis = this.yAxis;
        this.svg.append('g')
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
            .append("path")
                .datum( data )
                    .attr("clip-path", "url(#boxclip)")
                    .style("fill", "url(#" + pattern_name + ")")
                    .style("stroke", "none")
                    .attr("d", d3.line()
                        .x(function(d) { return xAxis(func_x(d)); })
                        .y(function(d) { return yAxis(func_y(d)); })
                    );

    }
}

 function load_entropy_plots(){


    function update_entropy_plot( doc_id, data, func_x, func_y, func_class, rank_data=null, active_filters=null ){

        var plt = new SVG_Plot(doc_id);

        plt.axis_font_size = "24px";
        plt.margin.left = 82;
        plt.margin.top = 10;
        plt.margin.bottom = 30;
        plt.margin.right = 10;

        plt.clear();
        plt.update_axes(data, func_x, func_y);
        plt.add_axes(rank_data != null,false,-20);
        plt.add_points( data, func_x, func_y, 2, d => func_class(d)+"_light" );

        if( rank_data != null && active_filters != null ){
            plt.add_clippath();
            active_filters.forEach( function(key) {
                plt.add_path( rank_data[key]['points'], d=>d[0], d=>d[1], key+"_regression regression" );
            });
        }
    }


     function update_areaplot( doc_id, data, func_x, func_y, func_class, rank_data=null, active_filters=null ){

        var plt = new SVG_Plot(doc_id);

        plt.axis_font_size = "24px";
        plt.margin.left = 82;
        plt.margin.top = 10;
        plt.margin.bottom = 30;
        plt.margin.right = 10;

        plt.clear();
        plt.update_axes(data, func_x, func_y);
        plt.add_pattern("pattern_chebyshev", 10,10, "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMCcgaGVpZ2h0PScxMCc+CiAgPHJlY3Qgd2lkdGg9JzEwJyBoZWlnaHQ9JzEwJyBmaWxsPScjRkZGRkZGMDAnLz4KICA8cGF0aCBkPSdNLTEsMSBsMiwtMgogICAgICAgICAgIE0wLDEwIGwxMCwtMTAKICAgICAgICAgICBNOSwxMSBsMiwtMicgc3Ryb2tlPScjQkE4NEU4RkYnIHN0cm9rZS13aWR0aD0nMScvPgo8L3N2Zz4K");
        plt.add_pattern("pattern_tda", 10,10, "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMCcgaGVpZ2h0PScxMCc+CiAgPHJlY3Qgd2lkdGg9JzEwJyBoZWlnaHQ9JzEwJyBmaWxsPScjRkZGRkZGMDAnIC8+CiAgPHJlY3QgeD0nMCcgeT0nMCcgd2lkdGg9JzInIGhlaWdodD0nMTAnIGZpbGw9JyNGRkI5ODdGRicgLz4KPC9zdmc+");
        if( rank_data != null && active_filters != null ){
            plt.add_clippath();
            active_filters.forEach( function(key) {
                val = rank_data[key];

                val['points'].push([val.points[val.points.length-1][0],0]);
                val['points'].push([0,0]);
                plt.add_pattern_area( rank_data[key]['points'], d=>d[0], d=>d[1], "pattern_" + key );

                val['points'].pop();
                val['points'].pop();
                plt.add_path( rank_data[key]['points'], d=>d[0], d=>d[1], key+"_regression regression" );
            });
        }
        plt.add_axes(true,false);
    }



    //d3.json( "metric?dataset=eeg_500&datafile=eeg_chan10_500&task=task_retrieve", function( error, dinput ) {
    fetch_metric( { 'dataset': 'eeg_500', 'datafile': 'eeg_chan10_500', 'task': 'task_retrieve' }, function( error, dinput ) {
        if (error) return console.warn(error);

        active_filters = ['chebyshev','tda']
        metrics_data = dinput['metric'].filter( d => active_filters.includes(d.info['filter name']) );
        rank_data = dinput['rank'].filter( d => d['x']=='approx entropy' && d['y']=='L1 norm' )[0]['result'];

        func_class = d => d['info']['filter name'] + "_filter";
        func_entropy = d => d['metrics']['approx entropy'];
        func_l1 = d => d['metrics']['L1 norm'];


        update_entropy_plot( "#fig_entropy_plot1", metrics_data, func_entropy, func_l1, func_class );
        update_entropy_plot( "#fig_entropy_plot2", metrics_data, func_entropy, func_l1, func_class, rank_data, active_filters );
        update_areaplot( "#fig_entropy_plot3", metrics_data, func_entropy, func_l1, func_class, rank_data, active_filters );
    });

 }