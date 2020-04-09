

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
    func_linf = function(d){ return d['metrics']['L_inf norm']; };
    func_wasserstein = function(d){ return d['metrics']['peak wasserstein']; };
    func_bottleneck = function(d){ return d['metrics']['peak bottleneck']; };


    update_scatterplot( "#entropy_l1", dinput, func_entropy, func_l1, func_class, rank_data.filter( d => d['x']=='approx entropy' && d['y']=='L1 norm' )[0]['result'], active_filters );
    update_scatterplot( "#entropy_linf", dinput, func_entropy, func_linf, func_class, rank_data.filter( d => d['x']=='approx entropy' && d['y']=='L_inf norm' )[0]['result'], active_filters );
    update_scatterplot( "#entropy_wass", dinput, func_entropy, func_wasserstein, func_class, rank_data.filter( d => d['x']=='approx entropy' && d['y']=='peak wasserstein' )[0]['result'], active_filters );
    update_scatterplot( "#entropy_bott", dinput, func_entropy, func_bottleneck, func_class, rank_data.filter( d => d['x']=='approx entropy' && d['y']=='peak bottleneck' )[0]['result'], active_filters );


    update_ranking( "entropy_l1_rank",   rank_data.filter( d => d['x']=='approx entropy' && d['y']=='L1 norm' )[0]['result'] )
    update_ranking( "entropy_linf_rank", rank_data.filter( d => d['x']=='approx entropy' && d['y']=='L_inf norm' )[0]['result'] );
    update_ranking( "entropy_wass_rank", rank_data.filter( d => d['x']=='approx entropy' && d['y']=='peak wasserstein' )[0]['result'] );
    update_ranking( "entropy_bott_rank", rank_data.filter( d => d['x']=='approx entropy' && d['y']=='peak bottleneck' )[0]['result'] );


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


function update_ranking( doc_id, rank_data ){
    html = '<span class="ranktext" style="text-decoration: underline;"><underline>Ranking</underline></span><br>'
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
