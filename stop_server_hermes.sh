#!/bin/bash

PIDLINE=`cat run_server_hermes.log | grep "Listening at"`
PID=`echo $PIDLINE | cut -d "[" -f3 | cut -d "]" -f1`
kill $PID
