

function load_dataset_summary_vis(){

    fetch_all_ranks( function( dinput ) {
        vis_rank_summary("#fig_dataset_summary_vis", preprocess_ranks( dinput, "eeg_500", "L1 norm", filter_list ) );
    });

}