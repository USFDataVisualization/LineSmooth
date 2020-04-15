

var metrics_data = null;
var rank_data = null;

function updateMetrics(){
    var active_filters = filter_list.filter( function(f){
        return document.getElementById("metric_"+f).checked;
    });

    dinput = metrics_data.filter( function(d){
        return active_filters.includes(d['info']['filter name']);
    });

    func_class = function(d){ return d['info']['filter name'] + "_filter"; };
    func_level = function(d){ return d['info']['filter level']; };
    func_time = function(d){ return d['info']['processing time']; };
    func_entropy = function(d){ return d['metrics']['approx entropy']; };
    func_l1 = function(d){ return d['metrics']['L1 norm']; };
    func_linf = function(d){ return d['metrics']['Linf norm']; };
    func_wasserstein = function(d){ return d['metrics']['peak wasserstein']; };
    func_bottleneck = function(d){ return d['metrics']['peak bottleneck']; };
    func_delta_vol = function(d){ return d['metrics']['delta volume']; };
    func_freq_pres = function(d){ return d['metrics']['frequency preservation']; };
    func_pcc = function(d){ return d['metrics']['pearson cc']; };
    func_src = function(d){ return d['metrics']['spearman rc']; };


    task = get_selected_task();
    document.getElementById("chart1_title").innerHTML = task_titles[task][0] + " vs. Entropy";
    document.getElementById("chart2_title").innerHTML = task_titles[task][1] + (task_titles[task][1].length>0?" vs. Entropy":"");

    console.log( document.getElementById("task").value )
    if( document.getElementById("task").value == 'task_retrieve' || document.getElementById("task").value == 'task_range' ){
        update_scatterplot( "#chart1", dinput, func_entropy, func_l1, func_class, rank_data.filter( d => d['x']=='approx entropy' && d['y']=='L1 norm' )[0]['result'], active_filters );
        update_scatterplot( "#chart2", dinput, func_entropy, func_linf, func_class, rank_data.filter( d => d['x']=='approx entropy' && d['y']=='Linf norm' )[0]['result'], active_filters );
        update_ranking( "chart1_rank",   rank_data.filter( d => d['x']=='approx entropy' && d['y']=='L1 norm' )[0]['result'] )
        update_ranking( "chart2_rank", rank_data.filter( d => d['x']=='approx entropy' && d['y']=='Linf norm' )[0]['result'] );
    }
    if( document.getElementById("task").value == 'task_extrema' || document.getElementById("task").value == 'task_anomalies' ){
        update_scatterplot( "#chart1", dinput, func_entropy, func_wasserstein, func_class, rank_data.filter( d => d['x']=='approx entropy' && d['y']=='peak wasserstein' )[0]['result'], active_filters );
        update_scatterplot( "#chart2", dinput, func_entropy, func_bottleneck, func_class, rank_data.filter( d => d['x']=='approx entropy' && d['y']=='peak bottleneck' )[0]['result'], active_filters );
        update_ranking( "chart1_rank", rank_data.filter( d => d['x']=='approx entropy' && d['y']=='peak wasserstein' )[0]['result'] );
        update_ranking( "chart2_rank", rank_data.filter( d => d['x']=='approx entropy' && d['y']=='peak bottleneck' )[0]['result'] );
    }

    if( document.getElementById("task").value == 'task_derive' ){
        update_scatterplot( "#chart1", dinput, func_entropy, func_delta_vol, func_class, rank_data.filter( d => d['x']=='approx entropy' && d['y']=='delta volume' )[0]['result'], active_filters );
        update_ranking( "chart1_rank", rank_data.filter( d => d['x']=='approx entropy' && d['y']=='delta volume' )[0]['result'] );
        $("#chart2").empty();
        document.getElementById("chart2_rank").innerHTML = "";
    }

    if( document.getElementById("task").value == 'task_characterize' || document.getElementById("task").value == 'task_cluster_trends' ){
        update_scatterplot( "#chart1", dinput, func_entropy, func_freq_pres, func_class, rank_data.filter( d => d['x']=='approx entropy' && d['y']=='frequency preservation' )[0]['result'], active_filters );
        update_ranking( "chart1_rank", rank_data.filter( d => d['x']=='approx entropy' && d['y']=='frequency preservation' )[0]['result'] );
        $("#chart2").empty();
        document.getElementById("chart2_rank").innerHTML = "";
    }

    if( document.getElementById("task").value == 'task_sort' || document.getElementById("task").value == 'task_cluster_points' ){
        update_scatterplot( "#chart1", dinput, func_entropy, func_pcc, func_class, rank_data.filter( d => d['x']=='approx entropy' && d['y']=='pearson cc' )[0]['result'], active_filters );
        update_scatterplot( "#chart2", dinput, func_entropy, func_src, func_class, rank_data.filter( d => d['x']=='approx entropy' && d['y']=='spearman rc' )[0]['result'], active_filters );
        update_ranking( "chart1_rank", rank_data.filter( d => d['x']=='approx entropy' && d['y']=='pearson cc' )[0]['result'] );
        update_ranking( "chart2_rank", rank_data.filter( d => d['x']=='approx entropy' && d['y']=='spearman rc' )[0]['result'] );
    }




}

function reloadMetrics(){
    console.log( "metric?" + $('#parameterForm').serialize() );
    d3.json( "metric?" + $('#parameterForm').serialize(), function( error, dinput ) {
        if (error) return console.warn(error);
        console.log( dinput );
        metrics_data = dinput['metric'];
        rank_data = dinput['rank'];
        updateMetrics();
    });
}


function update_ranking( doc_id, rank_data, title='Ranking' ){
    html = '<span class="ranktext" style="text-decoration: underline;"><underline>' + title + '</underline></span><br>'
            + '<span class="ranktext" style="color: darkgrey; font-size: small; ">Best</span><br>';

    keys = Object.keys(rank_data)
    keys.sort( (a,b) => rank_data[a]['rank'] - rank_data[b]['rank'] );
    keys.forEach( function(key) {
        if( document.getElementById("metric_"+key).checked ){
            val = rank_data[key];
            html += '<span class="rankbox ' + key + '_background"></span><span class="ranklabel">' + filter_short_names[key] + '</span><br>';
        }
    });

    html += '<span class="ranktext" style="color: darkgrey; font-size: small; ">Worst</span>';

    document.getElementById(doc_id).innerHTML = html;
}
