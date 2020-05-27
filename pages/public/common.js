
var filter_list = [ "median", "min", "max", "gaussian", "savitzky_golay", "mean", "cutoff", "butterworth", "chebyshev", "subsample", "rdp", "tda" ];

var filter_groups = [
    {"title": "Rank Filters", "filters": [ "median", "min", "max"] },
    {"title": "Convolutional Filters", "filters": ["gaussian", "savitzky_golay", "mean"] },
    {"title": "Freq. Domain Filters", "filters": ["cutoff", "butterworth", "chebyshev"] },
    {"title": "Subsampling", "filters": ["subsample", "tda", "rdp" ] }
];

var filter_short_names = {
    "median": "median",
    "gaussian": "Gaussian",
    "cutoff": "cutoff",
    "subsample": "uniform",
    "rdp": "Douglas-Peucker",
    "tda": "topology",
    "butterworth": "Butterworth",
    "chebyshev": "Chebyshev",
    "max": "max",
    "min": "min",
    "mean": "mean",
    "savitzky_golay": "Savitzky-Golay",
    "median_hollow": "median",
    "gaussian_hollow": "Gaussian",
    "cutoff_hollow": "cutoff",
    "subsample_hollow": "uniform",
    "rdp_hollow": "Douglas-Peucker",
    "tda_hollow": "topology",
    "butterworth_hollow": "Butterworth",
    "chebyshev_hollow": "Chebyshev",
    "max_hollow": "max",
    "min_hollow": "min",
    "mean_hollow": "mean",
    "savitzky_golay_hollow": "Savitzky-Golay"
};

var filter_long_names = {
    "median": "median",
    "gaussian": "Gaussian",
    "cutoff": "low-pass cutoff",
    "subsample": "uniform subsampling",
    "rdp": "Douglas-Peucker",
    "tda": "topology",
    "butterworth": "Butterworth",
    "chebyshev": "Chebyshev",
    "max": "max",
    "min": "min",
    "mean": "mean",
    "savitzky_golay": "Savitzky-Golay"
};

var metric_names = ['pearson cc', 'spearman rc', 'L1 norm', 'Linf norm', 'delta volume',
                    'frequency preservation', 'peak bottleneck', 'peak wasserstein'];

var metric_math_name = {'pearson cc': ["\u03C1",''],
                        'spearman rc': ['r','s'],
                        'L1 norm': ['\u2113\u2081',''],
                        'Linf norm': ['\u2113','\u221E'],
                        'delta volume': ["\u03B4a",''],
                        'frequency preservation': ["\u2131",''],
                        'peak wasserstein': ['W\u2081',''],
                        'peak bottleneck': ['W','\u221E'] };

var task_titles = { 'task_retrieve': ["Retrieve Value (average case): L<sup>1</sup>-norm", "Retrieve Value (worst case): L<sup>&#8734;</sup>-norm" ],
                        'task_range' : ["Determine Range (average case): L<sup>1</sup>-norm", "Determine Range (worst case): L<sup>&#8734;</sup>-norm" ],
                        'task_extrema' : ["Find Extrema (average case): Wasserstein", "Find Extrema (worst case): Bottleneck"],
                        'task_anomalies' : ["Find Anomalies (average case): Wasserstein", "Find Anomalies (worst case): Bottleneck"],
                        'task_derive' : ["Compute Derived Value (average case): Volume Preservation", "" ],
                        'task_characterize' : ["Characterize Distribution (average case): Frequency Preservation", ""],
                        'task_cluster_trends' : ["Cluster: Trends (average case): Frequency Preservation", ""],
                        'task_sort' : ["Sort: Pearson Correlation", "Sort: Spearman Rank Correlation"],
                        'task_cluster_points' : ["Cluster: Points: Pearson Correlation", "Cluster: Points: Spearman Rank Correlation"] };

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
            if( d == 'stock_price')
                html += '<option value="'+d+'" selected>'+d+'</option>';
            else
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
    if( document.getElementById("datafile") != null ){
        document.getElementById("datafile").innerHTML = html;
    }
    if( update_func ) update_func();
}

function insert_dataset_only_selector(){
    html = `    <div class="container" style="padding: 0;">
                  <div class="row">
                    <div class="col-4" style="padding-right: 3px;">
                        <label for="dataset" style="margin-top: 3px;" >Data Set</label>
                    </div>
                    <div class="col-8" style="padding-right: 3px;">
                        <select class="form-control form-control-sm" id="dataset" name="dataset" onchange="update_func();"></select>
                    </div>
                  </div>
               </div>`;
    document.write(html);
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

function select_filter_group( grp, grp_val, other_val = null ){
    filter_groups.forEach( function(fg){
        if( grp == fg['title'] ){
            fg['filters'].forEach( function(key){
                document.getElementById("metric_"+key).checked = grp_val;
            });
        }
        else if( other_val != null ){
            fg['filters'].forEach( function(key){
                document.getElementById("metric_"+key).checked = other_val;
            });
        }
    });
    if( update_func ) update_func();
}

function select_filter_only( filter ){
    filter_list.forEach( function(key){
        document.getElementById("metric_"+key).checked = key==filter;
    });
    if( update_func ) update_func();
}

function insert_filter_checkboxes(){
    html = '<div style="padding-top: 5px;">';
    filter_groups.forEach( function(fg){
        html += '<div style="padding-top: 5px;">';
        html += '<fieldset style="border: 1px black solid">';
        html += '<legend style="width: auto; font-size: 0.8em; border: 1px black solid; margin-left: 0.5em; padding: 0em 0.2em; ">' + fg['title']
                 + '<span style="font-size: 0.7em;">'
                 + ' ( <a href="javascript:void(0)" onclick="select_filter_group(\'' + fg['title'] + '\',true);">all</a> |'
                 + ' <a href="javascript:void(0)" onclick="select_filter_group(\'' + fg['title'] + '\', true, false);">only</a> |'
                 + ' <a href="javascript:void(0)" onclick="select_filter_group(\'' + fg['title'] + '\',false);">none</a> )'
                 + '</span></legend>';
        html += '<div style="padding-left: 10px;">'
        fg['filters'].forEach( function(key){
            html += '<label class="checkmark-container"><span style="font-variant: small-caps;">' + filter_long_names[key] + '</span>' +
                    '<span style="font-size: 0.7em;">' +
                    ' ( <a href="javascript:void(0)" onclick="select_filter_only(\'' + key + '\');">only</a> )' +
                    '</span>' +
                    '<input type="checkbox" id="metric_' + key + '" checked="checked" onchange="update_func();">' +
                    '<span class="checkmark checkmark_' + key + '"></span></label>';
        });
        html += '</div></fieldset></div>';
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

function insert_task_selector(){
    html = `<div class="form-group">
                <label for="task">Visual Analytic Task</label>
                <select class="form-control form-control-sm" id="task" name="task" onchange="update_task();">`;
    html += '<option value="task_retrieve">Retrieve Value</option>';
    html += '<option value="task_range">Determine Range</option>';
    html += '<option value="task_derive">Compute Derived Value</option>';
    html += '<option value="task_extrema">Find Extrema</option>';
    html += '<option value="task_anomalies">Find Anomalies</option>';
    html += '<option value="task_characterize">Characterize Distribution</option>';
    html += '<option value="task_sort">Sort</option>';
    html += '<option value="task_cluster_trends">Cluster: Trends</option>';
    html += '<option value="task_cluster_points">Cluster: Points</option>';
    html += '</select></div>';
    document.write(html);
}


var pages = ["index.html", "ranks-by-dataset.html", "ranks-by-datafile.html", "entropy-plots.html", "interactive-smoothing.html", "performance.html", "figures.html"];
var page_titles = {"index.html": "Summary Ranks",
                   "ranks-by-dataset.html": "Rank By Data Category",
                   "ranks-by-datafile.html": "Rank By Dataset",
                   "entropy-plots.html": "Entropy Plots",
                   "interactive-smoothing.html": "Interactive Smoothing",
                   "performance.html": "Performance Visualization",
                   "figures.html": "Paper Figures"};

function insert_navbar( curpage ){
    html = `<nav class="navbar navbar-expand-lg navbar-light bg-light">
              <a class="navbar-brand" href="index.html">LineSmooth</a>
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
                <h3 style="padding-left: 5px;">VAST 2020 Submission #1250</h3>
            </div>`;
    document.write(html);
}

function get_selected_dataset(){
    var e = document.getElementById("dataset");
    return e.options[e.selectedIndex].value;
}

function get_selected_datafile(){
    var e = document.getElementById("datafile");
    if( e == null ) return null;
    return e.options[e.selectedIndex].value;
}

function get_selected_task(){
    var e = document.getElementById("task");
    return e.options[e.selectedIndex].value;
}

function get_active_filters(){
    return filter_list.filter( key => document.getElementById("metric_"+key).checked );
}

