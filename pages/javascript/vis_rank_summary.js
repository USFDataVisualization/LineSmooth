


function preprocess_ranks( rank_data, dataset, metric_name, active_list=filter_list ){

    avg_ranks = {};
    active_list.forEach( function(k){
        avg_ranks[k] = 0;
    });

    ret = [];
    rank_data.filter( d => d['dataset']==dataset )
        .forEach( function(ds){

            // extract the appropriate rank data
            cur_set = [];
            r = ds['rank'][metric_name];
            active_list.forEach( function(k){
                cur_set.push( { 'class':k, 'rank': r[k]['rank'] } );
            });

            // re-rank the data
            cur_set.sort( function(a,b){ return a.rank-b.rank; });
            for( i = 0; i < cur_set.length; i++ ){
                avg_ranks[cur_set[i].class] += i+1;
                cur_set[i].rank = i+1;
            }

            ret.push( {"datafile": ds.datafile, "ranks": cur_set} );
        });

    avg_set = [];
    active_list.forEach( function(k){
        avg_set.push( { 'class':k, 'rank': avg_ranks[k] } );
    });

    // re-rank the data
    avg_set.sort( function(a,b){ return a.rank-b.rank; });
    for( i = 0; i < avg_set.length; i++ ){
        avg_set[i].rank = i+1;
    }

    ret.push( {"datafile": "average rank", "ranks": avg_set} );

    return ret;
}



function vis_rank_summary( doc_id, rank_data, startX=35, startY=55, xSpacing=55, ySpace=17, showRank=true, labelRotation=340, labelOffsetX=8 ){

    $(doc_id).empty();
    let svg = d3.select(doc_id);

    let instances = [];
    let links = [];

    let lineGenerator = d3.line().curve(d3.curveCardinal);


    function build_instance( r, x, y, box_size ){
        ret = []
        r.forEach( function(k){
            ret.push({ 'class':k.class, 'x': x, 'y': y + k.rank*ySpace, 'r': box_size, 'rank': k.rank });
        });
        return ret;
    }

    function find_links( inst0, inst1 ){
        res = []
        inst0.forEach( function(i0){
            i1 = inst1.find( function(t){
                return t.class == i0.class;
            });
            res.push( {'src':i0,'dst':i1} );
        });
        return res;
    }

    function make_path( start, end ){
        return lineGenerator([start,
                    [start[0]+(end[0]-start[0])/3, start[1]+(end[1]-start[1])/8],
                    [end[0]-(end[0]-start[0])/3, end[1]-(end[1]-start[1])/8],
                    end]);
    }

    function construct_points_and_paths( ){
        curX = startX;
        curY = startY;
        curR = 0;
        rank_data.forEach( function(ds){
            box_size = 9;

            if( ds.datafile=="average rank" || ds.datafile=="overall performance" ){
                box_size = 14;
                curX += xSpacing/4;
            }

            instances.push( build_instance( ds.ranks, curX, curY, box_size ) );
            if( curR > 0 ){
                links = links.concat( find_links( instances[instances.length-2], instances[instances.length-1] ) );
            }
            curR++;
            curX += xSpacing;
        });
    }

    function draw_path(links){
        svg.append("g").selectAll("path")
            .data(links)
            .enter().append("path")
            .attr( 'd', function(d){ return make_path( [d.src.x+15,d.src.y+7.5], [d.dst.x,d.dst.y+7.5] ); } )
            //.attr("class", function(d){ return d.src.class + "_filter_light"; })
            .attr("class", function(d){ return d.src.class + "_track"; })
            .attr("stroke-opacity", 0.6)
            .attr("fill", "none")
            .attr("stroke-width",7);
    }

    function label_method_names( instance ){
        let gtmp = svg.append("g");
        instance.forEach( function(f){
            gtmp.append("text")
                  .style("fill", "gray")
                  //.style("font-size", "14px")
                  .style("font-size", "17px")
                  .attr("dy", ".35em")
                  .attr("font-family", "Arial")
                  .attr("font-variant", "small-caps")
                  .attr("text-anchor", "start")
                  .attr("transform", "translate("+ (f.x+19) +","+ (f.y+7) +")")
                  .text( (showRank? String(f.rank) + ": " : "") + filter_short_names[ f.class ] );
        });
    }

    function draw_instances( instances ){
        instances.forEach( function(instance){
            svg.append("g").selectAll("rect")
                .data(instance)
                .enter().append("rect")
                            .attr("x", function(d){ return d.x+(15-d.r)/2; } )
                            .attr("y", function(d){ return d.y+(15-d.r)/2; } )
                            .attr("class", function(d){ return d.class + "_filter"; })
                            .attr("width", function(d){ return d.r; })
                            .attr("height", function(d){ return d.r; });
        });
    }

    function add_label( svg_g, text, tX, tY, r, font_size="13px" ){
        svg_g.append("text")
              .style("fill", "black")
              .style("font-size", font_size )
              .attr("dy", ".35em")
              .attr("font-family", "Arial")
              .attr("text-anchor", "start")
              .attr("transform", "translate(" + tX + "," + tY + ") rotate(" + r + ")")
              .text(text);
    }

    function label_datafiles(){
        curX = startX;
        let gtmp = svg.append("g");
        rank_data.forEach( function(d){
            if( d.datafile=='overall performance'){
                add_label( gtmp, 'overall', (curX+4), (startY+labelOffsetX-3), labelRotation, "16px" );
                add_label( gtmp, 'performance', (curX+25), (startY+labelOffsetX-3), labelRotation, "16px" );
            }
            else if (d.datafile=='average rank'){
                curX+=xSpacing/4;
                add_label( gtmp, d.datafile, (curX+4), (startY+labelOffsetX), labelRotation, "16px" );
            }
            else{
                add_label( gtmp, d.datafile, (curX+4), (startY+labelOffsetX), labelRotation, (d.datafile=='overall')?"16px":"14px" );
            }

            curX+=xSpacing;
        });
    }


    construct_points_and_paths();

    draw_path(links);
    label_datafiles( );
    label_method_names( instances[instances.length - 1] );
    draw_instances( instances );

}


