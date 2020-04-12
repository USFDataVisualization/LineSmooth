#!/bin/bash

. venv/bin/activate

mkdir ../chi_homicide
python process.py -ds chi_homicide -df weekly > ../chi_homicide/chi_homicide_weekly.json
python process.py -ds chi_homicide -df monthly > ../chi_homicide/chi_homicide_monthly.json


mkdir ../unemployment
python process.py -ds unemployment -df trade > ../unemployment/unemployment_trade.json
python process.py -ds unemployment -df manufacturing > ../unemployment/unemployment_manufacturing.json
python process.py -ds unemployment -df hospitality > ../unemployment/unemployment_hospitality.json
python process.py -ds unemployment -df business > ../unemployment/unemployment_business.json
python process.py -ds unemployment -df construction > ../unemployment/unemployment_construction.json
python process.py -ds unemployment -df edu_health > ../unemployment/unemployment_edu_health.json
python process.py -ds unemployment -df govt > ../unemployment/unemployment_govt.json
python process.py -ds unemployment -df finance > ../unemployment/unemployment_finance.json
python process.py -ds unemployment -df self_emp > ../unemployment/unemployment_self_emp.json
python process.py -ds unemployment -df other > ../unemployment/unemployment_other.json
python process.py -ds unemployment -df transport > ../unemployment/unemployment_transport.json
python process.py -ds unemployment -df info > ../unemployment/unemployment_info.json
python process.py -ds unemployment -df ag > ../unemployment/unemployment_ag.json
python process.py -ds unemployment -df mining > ../unemployment/unemployment_mining.json


mkdir ../nz_tourist
python process.py -ds nz_tourist -df monthly > ../nz_tourist/nz_tourist_monthly.json
python process.py -ds nz_tourist -df annually > ../nz_tourist/nz_tourist_annually.json


mkdir ../flights
python process.py -ds flights -df daily > ../flights/flights_daily.json
python process.py -ds flights -df weekly > ../flights/flights_weekly.json
python process.py -ds flights -df monthly > ../flights/flights_monthly.json

mkdir ../eeg_500
python process.py -ds eeg_500 -df chan05 > ../eeg_500/eeg_chan05_500.json
python process.py -ds eeg_500 -df chan10 > ../eeg_500/eeg_chan10_500.json
python process.py -ds eeg_500 -df chan15 > ../eeg_500/eeg_chan15_500.json
python process.py -ds eeg_500 -df chan20 > ../eeg_500/eeg_chan20_500.json
python process.py -ds eeg_500 -df chan25 > ../eeg_500/eeg_chan25_500.json
python process.py -ds eeg_500 -df chan30 > ../eeg_500/eeg_chan30_500.json

mkdir ../eeg_2500
python process.py -ds eeg_2500 -df chan05 > ../eeg_2500/eeg_chan05_2500.json
python process.py -ds eeg_2500 -df chan10 > ../eeg_2500/eeg_chan10_2500.json
python process.py -ds eeg_2500 -df chan15 > ../eeg_2500/eeg_chan15_2500.json
python process.py -ds eeg_2500 -df chan20 > ../eeg_2500/eeg_chan20_2500.json
python process.py -ds eeg_2500 -df chan25 > ../eeg_2500/eeg_chan25_2500.json
python process.py -ds eeg_2500 -df chan30 > ../eeg_2500/eeg_chan30_2500.json

mkdir ../eeg_10000
python process.py -ds eeg_10000 -df chan05 > ../eeg_10000/eeg_chan05_10000.json
python process.py -ds eeg_10000 -df chan10 > ../eeg_10000/eeg_chan10_10000.json
python process.py -ds eeg_10000 -df chan15 > ../eeg_10000/eeg_chan15_10000.json
python process.py -ds eeg_10000 -df chan20 > ../eeg_10000/eeg_chan20_10000.json
python process.py -ds eeg_10000 -df chan25 > ../eeg_10000/eeg_chan25_10000.json
python process.py -ds eeg_10000 -df chan30 > ../eeg_10000/eeg_chan30_10000.json

mkdir ../climate_max_temp
python process.py -ds climate_TMAX -df atl > ../climate_max_temp/climate_atl_tmax.json
python process.py -ds climate_TMAX -df jfk > ../climate_max_temp/climate_jfk_tmax.json
python process.py -ds climate_TMAX -df lax > ../climate_max_temp/climate_lax_tmax.json
python process.py -ds climate_TMAX -df ord > ../climate_max_temp/climate_ord_tmax.json
python process.py -ds climate_TMAX -df sea > ../climate_max_temp/climate_sea_tmax.json
python process.py -ds climate_TMAX -df slc > ../climate_max_temp/climate_slc_tmax.json

mkdir ../climate_prcp
python process.py -ds climate_PRCP -df atl > ../climate_prcp/climate_atl_prcp.json
python process.py -ds climate_PRCP -df jfk > ../climate_prcp/climate_jfk_prcp.json
python process.py -ds climate_PRCP -df lax > ../climate_prcp/climate_lax_prcp.json
python process.py -ds climate_PRCP -df ord > ../climate_prcp/climate_ord_prcp.json
python process.py -ds climate_PRCP -df sea > ../climate_prcp/climate_sea_prcp.json
python process.py -ds climate_PRCP -df slc > ../climate_prcp/climate_slc_prcp.json

mkdir ../climate_avg_wind
python process.py -ds climate_AWND -df atl > ../climate_avg_wind/climate_atl_awnd.json
python process.py -ds climate_AWND -df jfk > ../climate_avg_wind/climate_jfk_awnd.json
python process.py -ds climate_AWND -df lax > ../climate_avg_wind/climate_lax_awnd.json
python process.py -ds climate_AWND -df ord > ../climate_avg_wind/climate_ord_awnd.json
python process.py -ds climate_AWND -df sea > ../climate_avg_wind/climate_sea_awnd.json
python process.py -ds climate_AWND -df slc > ../climate_avg_wind/climate_slc_awnd.json


mkdir ../stock_price
python process.py -ds stock_close -df AAPL > ../stock_price/stock_aapl_price.json
python process.py -ds stock_close -df AMZN > ../stock_price/stock_amzn_price.json
python process.py -ds stock_close -df BAC > ../stock_price/stock_bac_price.json
python process.py -ds stock_close -df GOOG > ../stock_price/stock_goog_price.json
python process.py -ds stock_close -df INTC > ../stock_price/stock_intc_price.json
python process.py -ds stock_close -df JPM > ../stock_price/stock_jpm_price.json
python process.py -ds stock_close -df MSFT > ../stock_price/stock_msft_price.json
python process.py -ds stock_close -df TSLA > ../stock_price/stock_tsla_price.json
python process.py -ds stock_close -df TM > ../stock_price/stock_tm_price.json

mkdir ../stock_volume
python process.py -ds stock_volume -df AAPL > ../stock_volume/stock_aapl_volume.json
python process.py -ds stock_volume -df AMZN > ../stock_volume/stock_amzn_volume.json
python process.py -ds stock_volume -df BAC > ../stock_volume/stock_bac_volume.json
python process.py -ds stock_volume -df GOOG > ../stock_volume/stock_goog_volume.json
python process.py -ds stock_volume -df INTC > ../stock_volume/stock_intc_volume.json
python process.py -ds stock_volume -df JPM > ../stock_volume/stock_jpm_volume.json
python process.py -ds stock_volume -df MSFT > ../stock_volume/stock_msft_volume.json
python process.py -ds stock_volume -df TSLA > ../stock_volume/stock_tsla_volume.json
python process.py -ds stock_volume -df TM > ../stock_volume/stock_tm_volume.json

mkdir ../astro
python process.py -ds radioAstronomy -df output_115_120 > ../astro/astro_115_120.json
python process.py -ds radioAstronomy -df output_115_123 > ../astro/astro_115_123.json
python process.py -ds radioAstronomy -df output_115_128 > ../astro/astro_115_128.json
python process.py -ds radioAstronomy -df output_116_124 > ../astro/astro_116_124.json
python process.py -ds radioAstronomy -df output_116_134 > ../astro/astro_116_134.json

deactivate
