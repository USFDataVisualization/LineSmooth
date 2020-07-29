

function stringize( v ){
    if( v == 'nan' ) return 'NaN';
    return v.toFixed(4);
}

function reloadChart(){
    console.log("data?" + $('#parameterForm').serialize() );
    //d3.json( "data?" + $('#parameterForm').serialize(), function( dinput ) {
    fetch_data_form( function( dinput ) {

        console.log( dinput );
        document.getElementById("approx_ent_value").innerHTML = stringize(dinput['metrics']['approx entropy']);
        document.getElementById("l1_norm_value").innerHTML = stringize(dinput['metrics']['L1 norm']);
        document.getElementById("linf_norm_value").innerHTML = stringize(dinput['metrics']['Linf norm']);
        document.getElementById("wass_value").innerHTML = stringize(dinput['metrics']['peak wasserstein']);
        document.getElementById("bott_value").innerHTML = stringize(dinput['metrics']['peak bottleneck']);
        document.getElementById("delta_vol_value").innerHTML = stringize(dinput['metrics']['delta volume']);
        document.getElementById("freq_pres_value").innerHTML = stringize(dinput['metrics']['frequency preservation']);
        document.getElementById("pearson_value").innerHTML = stringize(dinput['metrics']['pearson cc']);
        document.getElementById("spearman_value").innerHTML = stringize(dinput['metrics']['spearman rc']);

        update_linechart( "#linechart", dinput );
    });
}


function changeFilter(){
    reloadChart();
}

function changeFilterLevel(){
    reloadChart();
}



