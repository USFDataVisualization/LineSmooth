

    function append_text( grp, x, y, text, align='start' ){
                 grp.append("text")
                  .style("fill", "gray")
                  .style("font-size", "18px")
                  .attr("dy", ".35em")
                  .attr("font-family", "Arial")
                  .attr("text-anchor", align)
                  .attr("transform", "translate("+ x +","+ y +")")
                  .text( text );
    }


function load_teaser(){

    var dset = 'dataset=eeg_500&datafile=eeg_chan10_500';

    var filter_levels = { "median": 0.85, "min": 0.23, "max": 0.24,
                          "gaussian": 0.625, "savitzky_golay": 0.15, "mean": 0.205,
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
                return t.class == i0.class;
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
        svg.append("g").selectAll("path")
            .data(links)
            .enter().append("path")
            .attr( 'd', function(d){ return make_path( [d.src.x+15,d.src.y+7.5], [d.dst.x,d.dst.y+7.5] ); } )
            .attr("class", function(d){ return d.src.class + "_filter_light"; })
            .attr("fill", "none")
            .attr("stroke-width",4);
    }


    function draw_ranks( svg, teaser_ranks ){
        curX = 28;
        last_rank = null;
        links = [];
        rank_order.forEach( function(rg){
            rg.subcats.forEach( function(n){
                        teaser_ranks[n].sort( function(a,b){ if(a.value<b.value) return -1; if(a.value>b.value) return 1; return 0; });
                        curY = 320;
                        for( i = 0; i < teaser_ranks[n].length; i++ ){
                            teaser_ranks[n][i].rank = i+1;
                            teaser_ranks[n][i].x = curX;
                            teaser_ranks[n][i].y = curY;
                            teaser_ranks[n][i].r = 21;
                            curY += 29;
                        }
                        curX += 30;
                        if( last_rank != null )
                            links = links.concat( find_links( last_rank,teaser_ranks[n]) );
                        last_rank = teaser_ranks[n];

            });
            curX += 20;
        });

        //draw_path(svg, links);


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

        curY = 328;
        for( i = 0; i < last_rank.length; i++ ){
            append_text( g_text, 344, curY, filter_short_names[ last_rank[i].class ] );
            append_text( g_text, 20, curY, (i+1), 'end' );
            curY += 29;
        }

        curX = 38;
        rank_order.forEach( function(rg){
            g_text.append("text")
                  .style("fill", "gray")
                  .style("font-size", "20px")
                  //.attr("dy", ".35em")
                  .attr("font-family", "Arial")
                  .attr("text-anchor", "start")
                  .attr("transform", "translate("+ (curX+(rg.subcats.length-1)*10) +","+ (312) +") rotate(330)")
                  .text( rg['title'] );

            rg.subcats.forEach( function(n){
                g_text.append("text")
                      .style("fill", "gray")
                      .style("font-size", "18px")
                      //.attr("dy", ".35em")
                      .attr("font-family", "Arial")
                      .attr("text-anchor", "middle")
                      .attr("transform", "translate("+ (curX-2) +","+ (674) +")")
                      .text( metric_math_name[n][0] )
                        .append("tspan")
                            .attr("dy","4")
                            .text(metric_math_name[n][1]);
                curX += 30;
            });
            curX += 20;
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
                add_linechart( "#fig_teaser", dinput['input'], dinput['input'], [5,10], [480,225], "dataset_fig_lines" );
            }

            add_linechart( "#fig_teaser", dinput['input'], dinput['output'], [500+335*j,5+180*i], [320,150], f + "_fig_filter" );
            //append_text( text_group, (5+335*i+15), (5+155*j+125), "approx entropy: " + dinput['metrics']['approx entropy'].toFixed(3) );
            append_text( text_group, (500+335*j+15), (5+180*i+10), filter_long_names[f] );

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
                 {"dataset":"eeg", "datafile": "eeg_chan10_10000", "title": "EEG Chan 10 (10k samples)"},
                 {"dataset":"flights", "datafile": "flights_daily", "title": "US Daily Domestic Flights"},
                 {"dataset":"eeg", "datafile": "eeg_chan10_2500", "title": "EEG Chan 10 (2.5k samples)"},
                 {"dataset":"flights", "datafile": "flights_weekly", "title": "US Weekly Domestic Flights"},
                 {"dataset":"eeg", "datafile": "eeg_chan10_500", "title": "EEG Chan 10 (500 samples)"},
                 {"dataset":"flights", "datafile": "flights_monthly", "title": "US Monthly Domestic Flights"},
                 {"dataset":"stock_price", "datafile": "stock_bac_price", "title": "Daily Stock Closing Price (BAC)"},
                 {"dataset":"unemployment", "datafile": "unemployment_ag", "title": "US Monthly Unemployment (Agriculture)"},
                 {"dataset":"stock_volume", "datafile": "stock_bac_volume", "title": "Daily Stock Volume (BAC)"},
                 {"dataset":"unemployment", "datafile": "unemployment_info", "title": "US Monthly Unemployment (InfoTech)"},
                 {"dataset":"climate_avg_wind", "datafile": "climate_lax_awnd", "title": "Daily Avg Wind Speed (LAX)"},
                 {"dataset":"astro", "datafile": "astro_115_128", "title": "Radio Astro 115/128"},
                 {"dataset":"climate_max_temp", "datafile": "climate_jfk_tmax", "title": "Daily High Temperature (JFK)"},
                 {"dataset":"astro", "datafile": "astro_116_134", "title": "Radio Astro 116/134"},
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

            add_linechart( "#fig_datasets", dinput['input'], dinput['input'], [5+335*i,10+155*j], [320,153], "dataset_fig_lines" );
            //append_text( text_group, (5+335*i+15), (5+155*j+125), "approx entropy: " + dinput['metrics']['approx entropy'].toFixed(3) );
            append_text( text_group, (5+335*i+15), (5+155*j+5), ds['title'] );

        });

	}

/*

	$('#fig_datasets').empty();

    let idx = 0;
    dsets.forEach( function(ds){
        load_dataset(idx, ds);
        idx++;
    });
*/
 }