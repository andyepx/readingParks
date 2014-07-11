<?php

	//include the API Builder mini lib
    require_once("api_builder_includes/class.API.inc.php");

    //set page to output JSON
    header("Content-Type: application/json; charset=utf-8");

    //If API parameters were included in the http request via $_GET...
    if(isset($_GET) && !empty($_GET)){

        //specify the columns that will be output by the api
        $columns = "PR_NO,
        			PARK_NAME,
        			NODE_ID,
        			NODE_USE,
        			NODES_NAME,
        			ITEM_ID,
        			ITEM_TYPE,
        			ITEMS_NAME,
        			DESCRIPTION,
        			EASTING,
        			NORTHING,
        			ORIG_FID,
        			LONGITUDE,
        			LATITUDE";

        //setup the API
        //the API constructor takes parameters in this order: host, database, table, username, password
        $api = new API("localhost", "parks", "ParkData", "root", "govhack");
        $api->setup($columns);
        $api->set_default_order("PR_NO");
        $api->set_searchable("PR_NO, PARK_NAME, ITEM_TYPE, ITEMS_NAME, DESCRIPTION");
        $api->set_default_search_order("PR_NO");
        $api->set_pretty_print(true);

        //sanitize the contents of $_GET to insure that 
        //malicious strings cannot disrupt your database

        if (isset($_GET['useAPI'])){
        	
        	$get_array = Database::clean($_GET);
        	echo $api->get_json_from_assoc($get_array);

        } else {

	        $mysql_query_string = "SELECT * FROM ParkData WHERE (LATITUDE < ".$_GET['minLat']." AND LATITUDE > ".$_GET['maxLat'].") AND (LONGITUDE > ".$_GET['minLong']." AND LONGITUDE < ".$_GET['maxLong'].") LIMIT 1000";
			//print_r($mysql_query_string);
	        $get_array = Database::get_all_results($mysql_query_string);

	        $json_obj = new StdClass();
	        $json_obj->data = $get_array;
	       // print_r($json_obj);
	        echo json_encode($json_obj, JSON_PRETTY_PRINT);

	        //print_r($get_array);

        }

        //output the results of the http request
       

    }



?>