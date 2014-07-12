<?php

	//include the API Builder mini lib
    require_once("api_builder_includes/class.API.inc.php");

    header("Content-Type: application/json; charset=utf-8");

    if(isset($_GET) && !empty($_GET)){

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

        $api = new API("localhost", "parks", "ParkData", "root", "govhack");
        $api->setup($columns);
        $api->set_default_order("PR_NO");
        $api->set_searchable("PR_NO, PARK_NAME, ITEM_TYPE, ITEMS_NAME, DESCRIPTION");
        $api->set_default_search_order("PR_NO");
        $api->set_pretty_print(true);

        if (isset($_GET['useAPI'])){
        	
        	$get_array = Database::clean($_GET);
        	echo $api->get_json_from_assoc($get_array);

        } else if (isset($_GET['fromTable']) && $_GET['fromTable']=="BookLocation") {

        	// Fix this query to only get the last update
        	if ($_GET['minLat'] != "")
        		$mysql_query_string = "SELECT * FROM ".$_GET['fromTable']." INNER JOIN Books ON Books.bookID = BookLocation.BookID WHERE entryID IN (SELECT MAX(entryID) FROM ".$_GET['fromTable']." GROUP BY bookID) AND (LATITUDE < ".$_GET['minLat']." AND LATITUDE > ".$_GET['maxLat'].") AND (LONGITUDE > ".$_GET['minLong']." AND LONGITUDE < ".$_GET['maxLong'].") ORDER BY lastUpdate DESC LIMIT 1000";
        	else if ($_GET['bookID'] != "")
        		$mysql_query_string = "SELECT * FROM ".$_GET['fromTable']." as A INNER JOIN ParkData ON A.Latitude = ParkData.LATITUDE AND A.Longitude = ParkData.LONGITUDE WHERE A.bookID = ".$_GET['bookID'];
        	//print_r($mysql_query_string);
	        $get_array = Database::get_all_results($mysql_query_string);

	        $json_obj = new StdClass();
	        $json_obj->data = $get_array;
	        echo json_encode($json_obj, JSON_PRETTY_PRINT);

        } else if (isset($_GET['fromTable']) && $_GET['fromTable']=="Books") {

        	// Fix this query to only get the last update

        	$mysql_query_string = "SELECT * FROM ".$_GET['fromTable']." WHERE bookCode = '".$_GET['bookCode']."'";
        	//print_r($mysql_query_string);
	        $get_array = Database::get_all_results($mysql_query_string);

	        $json_obj = new StdClass();
	        $json_obj->data = $get_array;
	        echo json_encode($json_obj, JSON_PRETTY_PRINT);

        } else {

	        $mysql_query_string = "SELECT * FROM ParkData WHERE (LATITUDE < ".$_GET['minLat']." AND LATITUDE > ".$_GET['maxLat'].") AND (LONGITUDE > ".$_GET['minLong']." AND LONGITUDE < ".$_GET['maxLong'].") LIMIT 1000";
	        $get_array = Database::get_all_results($mysql_query_string);

	        $json_obj = new StdClass();
	        $json_obj->data = $get_array;
	        echo json_encode($json_obj, JSON_PRETTY_PRINT);

        }


    }



?>