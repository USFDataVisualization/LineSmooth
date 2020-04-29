# LineSmooth: An Analytical Framework for Evaluating the Effectiveness of Smoothing Techniques on Line Charts

## VAST Submission 1250

This package contains our source code, data, and a web-based demonstration.


## To run the demo:

the We have tested this setup on Mac and Linux distributions. 

You may visit live versions of this package at __http://131.247.3.213:5250__ or __http://131.247.3.215:5250__

### [required] Install python3, python3-virtualenv, and git

    On Debian linux, such as Ubuntu
    > sudo apt install python3 python3-virtualenv git

    On Mac, you can download from python.org, macports, or homebrew. You will need python3, python3-virtualenv, pip, git, ... maybe others 


### [required] Run setup process

    This process will setup a virtual environment and install all prerequisites.
    > ./setup.sh
        
### [required] Generate the experiemental and start a webserver

    Run the server
    > ./run_server_debug.sh
    
    If everything goes as planned, you can open a webbrowser and open url http://localhost:5050
    
