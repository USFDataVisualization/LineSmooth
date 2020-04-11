

function stringize( v ){
    if( v == 'nan' ) return 'NaN';
    return v.toFixed(4);
}

function reloadChart(){
    console.log("data?" + $('#parameterForm').serialize() );
    d3.json( "data?" + $('#parameterForm').serialize(), function( dinput ) {

        console.log( dinput );
        document.getElementById("approx_ent_value").innerHTML = stringize(dinput['metrics']['approx entropy']);
        document.getElementById("l1_norm_value").innerHTML = stringize(dinput['metrics']['L1 norm']);
        document.getElementById("linf_norm_value").innerHTML = stringize(dinput['metrics']['Linf norm']);
        document.getElementById("wass_value").innerHTML = stringize(dinput['metrics']['peak wasserstein']);
        document.getElementById("bott_value").innerHTML = stringize(dinput['metrics']['peak bottleneck']);

        update_linechart( "#linechart", dinput );
    });
}


function changeFilter(){
    reloadChart();
}

function changeFilterLevel(){
    reloadChart();
}



