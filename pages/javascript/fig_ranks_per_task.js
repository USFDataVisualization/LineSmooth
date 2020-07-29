
function load_fig_ranks_per_task(){
    let all_rank_data = null;

    grades = {'count':0};
    metric_names.forEach(function(m){
        grades[m] = {};
        filter_list.forEach(function(d){
            grades[m][d]=0;
        });
    });


    function get_average_rank(ds, metric){
        pp_ranks = preprocess_ranks( all_rank_data, ds, metric, filter_list );

        grades.count++;
        pp_ranks.filter( d=> d.datafile!="average rank" ).forEach(function(d){
            d.ranks.forEach(function(r){
                if(r.rank <= 3 ) grades[metric][r.class]++;
            });
        });

        return pp_ranks.filter( d=> d.datafile=="average rank" )[0];
        /*
        console.log(tmp1);
        tmp = tmp1[0].ranks;
        return tmp.map( d => d.class );*/
    }

    function calculate_ranks( _data, score_func ){
        let data = _data;
        if( !Array.isArray(_data) )
            data = Object.values(_data);
        data.sort( function(a,b){
            if( score_func(a) < score_func(b) ) return -1;
            if( score_func(a) > score_func(b) ) return  1;
            return 0;
        });
        for( i = 0; i < data.length; i++){
            data[i].rank = i+1;
        }
        return _data;
    }



    metric_fig = { 'L1 norm': "fig_task_rv_l1",
                    'Linf norm': "fig_task_rv_linf",
                    'pearson cc': 'fig_task_s_pcc',
                    'spearman rc': 'fig_task_s_src',
                    'delta volume': 'fig_task_cdv',
                    'frequency preservation': 'fig_task_cd',
                    'peak bottleneck': 'fig_task_fe_bott',
                    'peak wasserstein': 'fig_task_fe_wass'
                };

    fetch_datasets( function( dinput ) {
        let datasets = Object.keys(dinput);
        fetch_all_ranks( function( dinput ) {
            all_rank_data = dinput;



            complete_ranks = { };

            metric_names.forEach( function( cur_metric) {


                let cur_data = []

                ///////////////////////////////////
                //
                // Calculate Per Dataset Ranks
                //
                datasets.forEach( function(ds){
                    pp = get_average_rank(ds, cur_metric);
                    pp.datafile = ds;
                    cur_data.push( pp );
                });


                ///////////////////////////////////
                //
                // Calculate Overall Ranks
                //
                let tot_ranks = {};
                filter_list.forEach( function(f){
                    tot_ranks[f] = {'class':f, 'score': 0, 'rank': 0, 'rank1': 0, 'rank2': 0, 'rank3': 0, 'rankOther': 0};
                });

                all_rank_data.filter( x => x.datafile!='overall').forEach(function(d){
                    filter_list.forEach( function(f){
                        tot_ranks[f].score += d.rank[cur_metric][f].rank/80;
                        if( d.rank[cur_metric][f].rank == 1 ) tot_ranks[f].rank1++;
                        if( d.rank[cur_metric][f].rank == 2 ) tot_ranks[f].rank2++;
                        if( d.rank[cur_metric][f].rank == 3 ) tot_ranks[f].rank3++;
                        if( d.rank[cur_metric][f].rank >= 4 ) tot_ranks[f].rankOther++;
                    });
                });
                complete_ranks[cur_metric] = calculate_ranks(tot_ranks, d=>d.score);
                cur_data.push( {'datafile': 'overall performance', 'ranks': Object.values(tot_ranks) });


                ///////////////////////////////////
                //
                // Find Top Filters for Tracks
                //
                let top_filters = new Set();
                filter_list.forEach( function(f){
                    if( tot_ranks[f].rank <= 4 ) top_filters.add( f );
                });

                cur_data.forEach( function(cd){
                    cd.ranks.forEach( function(r){
                        if( !top_filters.has(r.class) )
                            r.class = r.class + "_hollow";
                    });

                });


                ///////////////////////////////////
                //
                // Draw Visualization
                //
                vis_rank_summary("#" + metric_fig[cur_metric], cur_data, 5, 50, 40, 18, false, 320, 14 );
            });



            ///////////////////////////////////
            //
            // Calculate Grades
            //
            let metric_task = {"L1 norm": 'rv', "Linf norm": 'rv',
                                "peak wasserstein": 'fe', "peak bottleneck": 'fe',
                                "pearson cc": 's', "spearman rc": 's',
                                "delta volume": 'cdv',
                                "frequency preservation": 'cd' };

            grades = { 'rv':{}, 'fe':{}, 's':{}, 'cdv':{}, 'cd':{} };

            Object.keys(grades).forEach( function(k) {
                filter_list.forEach(function(f){
                    grades[k][f] = {'count':0,'metrics':0,'grade':'-'};
                });
            });

            Object.keys(metric_task).forEach( function(m) {
                filter_list.forEach(function(f){
                    k = metric_task[m];
                    grades[k][f].count += complete_ranks[m][f].rank1 / 80;
                    grades[k][f].count += complete_ranks[m][f].rank2 / 80;
                    grades[k][f].count += complete_ranks[m][f].rank3 / 80;

                    cur_score = grades[k][f].count / ++grades[k][f].metrics;

                    grades[k][f].grade = 'X'
                    if( cur_score >= 0.05 ) grades[k][f].grade = 'D';
                    if( cur_score >= 0.25 ) grades[k][f].grade = 'C';
                    if( cur_score >= 0.5 ) grades[k][f].grade = 'B';
                    if( cur_score >= 0.75 ) grades[k][f].grade = 'A';
                });
            });

            ///////////////////////////////////
            //
            // Output Grades to Console
            //
            filter_list.forEach(function(f){
                let str = f + ' & ';
                str += '\\S' + grades['rv'][f].grade + ' & ';
                str += '\\S' + grades['rv'][f].grade + ' & ';
                str += '\\S' + grades['cdv'][f].grade + ' & ';
                str += '\\S' + grades['fe'][f].grade + ' & ';
                str += '\\S' + grades['fe'][f].grade + ' & ';
                str += '\\S' + grades['cd'][f].grade + ' & ';
                str += '\\S' + grades['s'][f].grade + ' & ';
                str += '\\S' + grades['cd'][f].grade + ' & ';
                str += '\\S' + grades['s'][f].grade + ' \\\\ ';
                console.log(str);
            });


        });




    });

}
