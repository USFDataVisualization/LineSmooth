// #0039e6, #ccd9ff
// #e68a00, #ffe0b3
// #00802b, #80ffaa
// #b30000, #ff9999
// #9900cc, #ecb3ff
// #86592d, #ecd9c6
// #ff33ff, #ffccff
// #00b8e6, #b3f0ff
// #408000, #b3ff66
// #802b00, #ffbb99
// #6600cc, #d9b3ff
// #0086b3, #99e6ff

var filter_list = [ "min", "max", "median", "gaussian", "mean", "savitzky_golay", "cutoff", "butterworth", "chebyshev", "subsample", "rdp", "tda" ];

var filter_short_names = {
    "median": "Median",
    "gaussian": "Gaussian",
    "cutoff": "Cutoff",
    "subsample": "Uniform",
    "rdp": "Douglas-Peucker",
    "tda": "Topology",
    "butterworth": "Butterworth",
    "chebyshev": "Chebyshev",
    "max": "Maximum",
    "min": "Minimum",
    "mean": "Mean",
    "savitzky_golay": "Savitzky-Golay"
};

var filter_long_names = {
    "median": "Median",
    "gaussian": "Gaussian",
    "cutoff": "Low-Pass Cutoff",
    "subsample": "Uniform Subsampling",
    "rdp": "Douglas-Peucker",
    "tda": "Topology",
    "butterworth": "Butterworth",
    "chebyshev": "Chebyshev",
    "max": "Maximum",
    "min": "Minimum",
    "mean": "Mean",
    "savitzky_golay": "Savitzky-Golay"
};

var datasets = {};

var update_func = null;


function load_datasets( __update_func ){
    update_func = __update_func;
    d3.json( "datasets", function( dinput ) {
        datasets = dinput;

        html = "";
        keys = Object.keys(datasets);
        keys.sort();

        keys.forEach( function(d){
            html += '<option value="'+d+'">'+d+'</option>';
        });

        document.getElementById("dataset").innerHTML = html;

        change_dataset();
    });
}


function change_dataset(){
    var e = document.getElementById("dataset");
    var dset = e.options[e.selectedIndex].value;
    datasets[dset].sort();
    html = "";
    datasets[dset].forEach( function(d){
        html += '<option value="'+d+'">'+d+'</option>';
    });
    document.getElementById("datafile").innerHTML = html;
    if( update_func ) update_func();
}

function insert_dataset_selector(){
    html = `    <div class="container" style="padding: 0;">
                  <div class="row">
                    <div class="col-4" style="padding-right: 3px;">
                        <label for="dataset" style="margin-top: 3px;" >Data Set</label>
                    </div>
                    <div class="col-8" style="padding-right: 3px;">
                        <select class="form-control form-control-sm" id="dataset" name="dataset" onchange="change_dataset();"></select>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-4" style="padding-right: 3px;">
                            <label for="datafile" style="margin-top: 3px;" >Data File</label>
                    </div>
                    <div class="col-8" style="padding-right: 3px;">
                            <select class="form-control form-control-sm" id="datafile" name="datafile" onchange="update_func();"></select>
                    </div>
                  </div>
               </div>`;
    document.write(html);
}


function insert_filter_checkboxes(){
    html = '<div style="padding-top: 10px;">';
    filter_list.forEach( function(key){
        html += '<label class="checkmark-container">' + filter_long_names[key] +
                '<input type="checkbox" id="metric_' + key + '" checked="checked" onchange="update_func();">' +
                '<span class="checkmark checkmark_' + key + '"></span></label>';
    });
    html += '</div>';
    document.write(html);
}


function insert_filter_selector(){
    html = `<div class="form-group">
                <label for="filter">Filter Type</label>
                <select class="form-control form-control-sm" id="filter" name="filter" onchange="update_func();">`;

    filter_list.forEach( function(key){
        html += '<option value="' + key + '">' + filter_long_names[key] + '</option>';
    });
    html += '</select></div>';
    document.write(html);
}

var pages = ["index.html", "ranks.html", "performance.html", "figures.html"];
var page_titles = {"index.html": "Interactive Smoothing",
                   "ranks.html": "Ranking Visualization",
                   "performance.html": "Performance Visualization",
                   "figures.html": "Paper Figures"};

function insert_navbar( curpage ){
    html = `<nav class="navbar navbar-expand-lg navbar-light bg-light">
              <a class="navbar-brand" href="index.html">Line Chart Smoothing</a>
              <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
              </button>
              <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">`;

    pages.forEach(function(key){
        if( curpage == key ){
            html += '<li class="nav-item active">';
        }
        else{
            html += '<li class="nav-item">';
        }
        html += '<a class="nav-link" href="' + key + '">' + page_titles[key] + '</a>';
        html += '</li>';
    });

    html += `    </ul>
               </div>
             </nav>`;
    document.write(html);
}

function insert_page_header(){
    html = `<div class="page" style="padding: 15px;">
                <h1 style="margin: 0;">A Framework for the Analytical Evaluation of Line Chart Smoothing</h1>
                <h3 style="padding-left: 5px;">InfoVis 2020 Submission #???</h3>
            </div>`;
    document.write(html);
}
