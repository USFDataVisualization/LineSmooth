
function fetch_datasets( callback ){
    d3.json( "datasets", callback );
}

function fetch_all_ranks( callback ){
    d3.json( "/all_ranks", callback );
}

function fetch_data( params, callback ){
    d3.json( "data?" + $.param(params, true), callback );
}

function fetch_data_form( callback ){
    d3.json( "data?" + $('#parameterForm').serialize(), callback );
}

function fetch_metric( params, callback ){
    d3.json( "metric?" + $.param(params, true), callback );
}

function fetch_metrics_form( callback ){
    d3.json( "metric?" + $('#parameterForm').serialize(), callback );
}
