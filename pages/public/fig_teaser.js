

    function append_text( grp, x, y, text ){
                 grp.append("text")
                  .style("fill", "gray")
                  .style("font-size", "16px")
                  .attr("dy", ".35em")
                  .attr("font-family", "Arial")
                  .attr("text-anchor", "start")
                  .attr("transform", "translate("+ x +","+ y +")")
                  .text( text );
    }


function load_teaser(){

    var dset = 'dataset=eeg&datafile=eeg_chan10_500';

    var filter_levels = { "median": 0.85, "min": 0.23, "max": 0.24,
                          "gaussian": 0.625, "savitzky_golay": 0.15, "mean": 0.205,
                          "cutoff": 0.915, "butterworth": 0.64, "chebyshev": 0.923,
                          "subsample": 0.91, "tda": 0.8, "rdp": 0.765 };

    function stringize( v ){
        if( v == 'nan' ) return 'NaN';
        return v.toFixed(3);
    }


	function load_dataset( idx, f, f_level ){
        var teaser_svg = d3.select("#fig_teaser");
        var text_group = teaser_svg.append("g");

        d3.json( "data?" + dset + "&filter=" + f + "&level=" + f_level, function( dinput ) {
            let i = Math.floor(idx/3);
            let j = idx%3;

            add_linechart( "#fig_teaser", dinput['input'], dinput['output'], [5+335*i,5+155*j], [320,153], f + "_fig_filter" );
            //append_text( text_group, (5+335*i+15), (5+155*j+125), "approx entropy: " + dinput['metrics']['approx entropy'].toFixed(3) );
            append_text( text_group, (5+335*i+15), (5+155*j+10), filter_long_names[f] );

        });

	}


	$('#fig_teaser').empty();

    let idx = 0;
    filter_list.forEach( function(key){
        load_dataset(idx, key,filter_levels[key]);
        idx++;
    });

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


	$('#fig_datasets').empty();

    let idx = 0;
    dsets.forEach( function(ds){
        load_dataset(idx, ds);
        idx++;
    });

 }