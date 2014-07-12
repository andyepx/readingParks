<?php
    // include the API Builder Database class
    require_once('api_builder_includes/class.Database.inc.php');
    //var_dump($_POST);
    //if POST is present...
    if(isset($_POST) &&
       !empty($_POST)){

        // Do any neccissary validation here. You can use something like https://github.com/ASoares/PHP-Form-Validation
        // if you are not going to validate input, which you absolutely should if users are submitting it, then at least
        // make sure the correct values are present
        if (isset($_POST['title']) && !empty($_POST['title']) &&
           isset($_POST['author']) && !empty($_POST['author'])) {

            // Open the database connection. This is what happens inside of the API class constructor
            // but if this page is simply for submitting data to the database you can just call this method
            Database::init_connection("localhost", "parks", "Books", "root", "govhack");

            // Sanitize the array so that it can be safely inserted into the database.
            // This method uses MySQLi real escape string and htmlspecialchars encoding.
            //$post_array = Database::clean($_POST);

          $json_obj = new StdClass();

            $mysql_query_string = "INSERT INTO Books (Title, Author) VALUES ('".$_POST['title']."', '".$_POST['author']."')";
            $get_array = Database::execute_sql_add($mysql_query_string);

            $json_obj->lastBookId = $get_array;

            if ($json_obj->lastBookId != -1) {
                $mysql_query_string = "INSERT INTO BookLocation (bookID, Latitude, Longitude) VALUES (".$json_obj->lastBookId.", ".$_POST['latitude'].", ".$_POST['longitude'].")";
                //print_r($mysql_query_string);
                $get_array = Database::execute_sql_add($mysql_query_string);
            }

            $json_obj->lastLocationId = $get_array;
            
            echo json_encode($json_obj, JSON_PRETTY_PRINT);

            //submit the data to your table.
            // if($r = Database::execute_from_assoc($post_array, Database::$table)){
            //   print_r($r);
            // } else {
            //   echo "There was an error submitting the data to the database";
            // }
        } else echo "One or more of the required values is missing from the POST";
    } else echo "Nothing was added to the database because the http request has no POST values";
?>