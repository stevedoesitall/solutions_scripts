<?php
//  . . .
 //ensure user is logged in
 if (!isset($_SESSION['user']) && $_SERVER["HTTP_USER_AGENT"]=="Sailthru Content Spider [Sailthru Client Name/12334567832481348asfasdf]") {
 redirect("login_page");
 }
//  . . . web page desired to be spidered . . .

