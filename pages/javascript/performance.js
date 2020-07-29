

        var metrics_data = null;


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

            log_scatterplot( "#info_perf",   dinput, func_level, func_time, func_class );
        }


        function reloadMetrics(){
            //d3.json( "metric?" + $('#parameterForm').serialize(), function( dinput ) {
            fetch_metrics_form( function( dinput ) {
                metrics_data = dinput['metric'];
                updateMetrics();
            });
        }

