
function fetch_datasets( callback ){
    d3.json( "json/datasets.json", callback );
}

function fetch_all_ranks( callback ){
    d3.json( "json/all_rank_data.json", callback );
}

function fetch_data( params, callback ){
	console.log(params);
    d3.json( "data?" + $.param(params, true), callback );
}


let currLoadedDatafile = null;
let currLoadedData = null;

function fetch_data_form( callback ){
	/*
		console.log($('#parameterForm'));
	console.log($('#dataset').val());
	console.log($('#datafile').val());
	console.log($('#filter').val());
		console.log($('#level').val());
*/
	
	let fn = "json/" + $('#dataset').val() + "/" + $('#datafile').val() + "/" + $('#filter').val() + ".json";
	
	if( fn == currLoadedDatafile ){
		fd0 = currLoadedData.filter( _d => _d['info']['filter level'] == 0 )[0];
		fdCurr = currLoadedData.filter( _d => _d['info']['filter level'] == $('#level').val() )[0];
		fdCurr['input'] = fd0['output'];
		callback(fdCurr);
	}
	else{
		//console.log(fn);
		d3.json( fn, function(d){
			currLoadedDatafile = fn;
			currLoadedData = d;
			fd0 = currLoadedData.filter( _d => _d['info']['filter level'] == 0 )[0];
			fdCurr = currLoadedData.filter( _d => _d['info']['filter level'] == $('#level').val() )[0];
			fdCurr['input'] = fd0['output'];
			callback(fdCurr);
		});
	}
//    d3.json( "data?" + $('#parameterForm').serialize(), callback );
}

function fetch_metric( params, callback ){
		console.log(params);
    d3.json( "metric?" + $.param(params, true), callback );
}

function fetch_metrics_form( callback ){
	//	console.log($('#parameterForm'));
	let fn = "json/" + $('#dataset').val() + "/" + $('#datafile').val() + "/" + "metric.json";

	d3.json( fn, callback );
    //d3.json( "metric?" + $('#parameterForm').serialize(), callback );
}
