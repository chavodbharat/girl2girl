<?php
//http://missoandfriends.org/girl2girl-groups/cooking/forum/topic/new-test-topic/
require_once('addHooks.php');

function theme_enqueue_styles() {
	//css files
    wp_enqueue_style( 'avada-parent-stylesheet', get_template_directory_uri() . '/style.css' );
    wp_enqueue_style( 'child-style', get_stylesheet_directory_uri() . '/style.css', array( 'avada-parent-stylesheet' ) );
	wp_enqueue_style( 'custom-buddypress-style', get_stylesheet_directory_uri() . '/asserts/buddypress-css/custom-style.css');
	wp_enqueue_style( 'custom-buddypress-style', get_stylesheet_directory_uri() . '/asserts/buddypress-css/custom-masonary.css');
	//Js files
	wp_enqueue_script('custom-isotope', get_stylesheet_directory_uri() . '/asserts/js/isotope.pkgd.min.js',array('jquery'),'1.4',true);
	wp_enqueue_script( 'box-height', get_stylesheet_directory_uri() . '/asserts/js/custom.js', array( 'jquery' ),'',true);
	wp_enqueue_script('isotope', get_stylesheet_directory_uri() . '/asserts/js/jquery.isotope.min.js', array( 'jquery' ),'',true);
	wp_enqueue_script('infinitescroll', get_stylesheet_directory_uri() . '/asserts/js/jquery.infinitescroll.min.js', array( 'jquery' ),'',true);
	

}
add_action( 'wp_enqueue_scripts', 'theme_enqueue_styles' );

/*
function friendshipAccepted ($friendship_id, $initiator_user_id, $friend_user_id, $friendship) {
	$myrows = $wpdb->get_results( "SELECT push_token from wp_dyn_push_tokens where id in ($initiator_user_id, 646373)" );
	$tokens = array();
	foreach ($myrows as $row) {
		array_push($tokens, $row->push_token);
	}
	$friend_name = get_author_name($friend_user_id);
	sendToken('friendship_accepted', $tokens, [
		'event'        => 'friendship_accepted',
		'initiator'    => $initiator_user_id,
		'friend'       => $friend_user_id,
	], 'Friendship accepted', "$friend_name accepted friendship!");
}

do_action( 'friends_friendship_accepted', 'friendshipAccepted', 10, 4);
*/

function avada_lang_setup() {
	$lang = get_stylesheet_directory() . '/languages';
	load_child_theme_textdomain( 'Avada', $lang );
}
add_action( 'after_setup_theme', 'avada_lang_setup' );

/* Select user for Gravity Form Editor to prevent all users being loaded 
add_filter( 'gform_author_dropdown_args', 'set_users' );
function set_users( $args ) {
    $args['include'] = '649185';
    return $args;
}
*/
/* Bottom Ad - Add Banner Add after Loop 
add_action( 'avada_after_main_container', 'avada_add_banner' );
function avada_add_banner() {
	echo '<div class="custom-bottom-ad"><a href="https://staging.missoandfriends.com/winitz-giveaways/"><img src="https://staging.missoandfriends.com/wp-content/uploads/2017/11/Winitz-holiday-giveaway-header.jpg" border="0"></a></div>';
} */
/* Display BP user id instead of Real Name */
define( 'BP_SHOW_DISPLAYNAME_ON_PROFILE', false );
/* Gravity Forms User registration */
add_filter( 'gform_user_registration_prepared_value', function ( $value, $field, $input_id, $entry, $is_username ) {
  if($field->id == 12 && empty($value)){
    return $entry['14'];
  }
  return $value;
}, 10, 5 );

add_filter( 'gform_user_registration_validation_message', 'update_validation_msgs', 10, 2 );
function update_validation_msgs( $message, $form ) {   
    return $message;
}
/* MISS O BADGES 
function get_misso_badges()
{
    global $wpdb,$bp;
	 $bpUserId = ( bp_loggedin_user_id() != $bp->displayed_user->id)?$bp->displayed_user->id:bp_loggedin_user_id();
	   $sql_statement = "SELECT badge_image_file, COUNT( badge_count ) as badge_count FROM {$wpdb->prefix}misso_badges INNER JOIN {$wpdb->prefix}misso_user_badges USING(badge_id)  WHERE user_id=" . $bpUserId . "  GROUP BY badge_image_file ORDER BY earned_date DESC";
    $badges = $wpdb->get_results($sql_statement);
     return ( $badges );
} */

//Custom avatar for no avatar user
function myavatar_add_default_avatar( $url ){
return get_stylesheet_directory_uri() .'/images/misso-heart.gif';
}
add_filter( 'bp_core_mysteryman_src', 'myavatar_add_default_avatar' );
/* BBPress Replies Ordering */

/* REMOVE PAGINATION ON WOOCOMMERCE AUCTIONS */
remove_action( 'woocommerce_after_shop_loop', 'woocommerce_pagination', 10 );
/* BuddyPress Friends $ Gropus Pages Customizations */

function load_directory_panel() {
   locate_template(array("directory-panel.php" ), true);
}
add_action('bp_after_directory_members_list', 'load_directory_panel');
add_action('bp_after_groups_loop', 'load_directory_panel');


function missoandfriends_load_more_pagination() {

    global $groups_template;
	
    // register our main script but do not enqueue it yet
    wp_register_script('ajaxloadmore', get_stylesheet_directory_uri() . '/asserts/js/ajaxloadmore.js');

    // now the most interesting part
    // we have to pass parameters to ajaxloadmore.js script but we can get the parameters values only in PHP
    // you can define variables directly in your HTML but I decided that the most proper way is wp_localize_script()
    wp_localize_script('ajaxloadmore', 'misso_loadmore_params', array(
        'ajaxurl' => site_url() . '/wp-admin/admin-ajax.php', // WordPress AJAX
        // 'posts' => serialize( $wp_query->query_vars ), // everything about your loop is here
        'current_page' => 1,
        //'max_page' => $wp_query->max_num_pages
    ));

    wp_enqueue_script('ajaxloadmore');
}

add_action('wp_enqueue_scripts', 'missoandfriends_load_more_pagination');

/**
 * 
 */
function missoandfriends_loadmore_ajax_handler() {
    ?>

    <?php
	$page=$_POST['page']+1;
   ?>  
<?php 
if($_POST['page_name']=='grouploop'):
if ( bp_has_groups( bp_ajax_querystring( 'groups' ).'&page='.$page.'&per_page=20' ) ) : 
?>
<?php while ( bp_groups() ) : bp_the_group(); ?>
    <div class="grid-item">
	
                <div class="main-block-listing">
				<?php if ( ! bp_disable_group_avatar_uploads() ) : ?>
						<div class="listing-img-block">
								<a href="<?php bp_group_permalink(); ?>"><?php bp_group_avatar( 'type=thumb&width=100&height=100' ); ?></a>
								<span class="listing-count"><span class="member-count"><?php echo preg_replace('/\D/', '', bp_get_group_member_count());  ?></span></span>
							</div>
					<?php endif; ?>		
                    
					 <div class="listing-content">
                <div class="listing-title">
				<a href="<?php bp_group_permalink(); ?>forum/"><?php bp_group_name(); ?></a>
                   
                </div>
                <div class="listing-meta">
                    <span><?php printf( __( 'active %s', 'buddypress' ), bp_get_group_last_active() ); ?></span>
                </div>
                <div class="listing-content">
                   <?php bp_group_description_excerpt(); ?>
                </div>
				<?php

				/**
				 * Fires inside the listing of an individual group listing item.
				 *
				 * @since 1.1.0
				 */
				do_action( 'bp_directory_groups_item' ); ?>
            </div>
            <div class="listing-footer">
			<?php

				/**
				 * Fires inside the action section of an individual group listing item.
				 *
				 * @since 1.1.0
				 */
				do_action( 'bp_directory_groups_actions' ); ?>
                <span><?php bp_group_type(); ?>/<?php bp_group_member_count(); ?></span>
            </div>
                </div>
            </div>
			<?php endwhile; ?>
    <?php
	endif;
	
	elseif($_POST['page_name']=='memberloop') : ?>
	 <?php if ( bp_has_members( bp_ajax_querystring( 'members' ).'&page='.$page.'&per_page=20' ) ) : ?>
		<?php while ( bp_members() ) : bp_the_member(); ?>
		<div class="grid-item">
                <div class="main-block-listing"> 
					<div class="listing-img-block">
						<a href="<?php bp_member_permalink(); ?>"><?php bp_member_avatar(75,75); ?></a>
                        <span class="online-status"><?php do_action('bp_member_online_status', bp_get_member_user_id()); ?></span>
							<p class="online-tooltip"><?php bp_member_last_active(); ?></p>
								
					</div>
					 <div class="listing-content">
						<div class="listing-title">
							<a href="<?php bp_member_permalink(); ?>"><?php bp_member_name(); ?></a>
							<?php if(function_exists( 'bp_core_iso8601_date' )) : ?>
							<div class="item-meta"><span class="activity" data-livestamp="<?php bp_core_iso8601_date( bp_get_member_last_active( array( 'relative' => false ) ) ); ?>"><?php bp_member_last_active(); ?></span></div>
							<?php else: ?>
								<div class="item-meta"><span class="activitys"><?php bp_member_last_active(); ?></span></div>
							<?php endif; ?>
						</div>	
						 <?php do_action( 'bp_directory_members_item' ); ?>
					
                <div class="listing-content">
					  <?php if ( bp_get_member_latest_update() ) : ?>

							<span class="update"> <?php bp_member_latest_update(); ?></span>

						<?php endif; ?>
				   
					 <?php

						/**
						 * Fires inside the display of a directory member item.
						 *
						 * @since 1.1.0
						 */
						do_action( 'bp_directory_members_item' ); ?>
						
						<div class="action">
							<?php

							/**
							 * Fires inside the members action HTML markup to display actions.
							 *
							 * @since 1.1.0
							 */
							do_action( 'bp_directory_members_actions' ); ?>
		  
						</div>
				 </div>
				</div>	 
				
				</div>
		</div>		
	<?php 
		endwhile;
	endif;
	?>
	<?php
	
	endif;
	
    wp_die(); // here we exit the script and even no wp_reset_query() required!
}

add_action('wp_ajax_loadmore', 'missoandfriends_loadmore_ajax_handler'); // wp_ajax_{action}
add_action('wp_ajax_nopriv_loadmore', 'missoandfriends_loadmore_ajax_handler'); // wp_ajax_nopriv_{action}


/**
* Add Approve replay link
*/
add_filter( 'post_row_actions', function ( $actions, $post )
{
	if ($post->post_type=='reply')
	{
		if ( get_post_status( $post ) != 'publish' )
		{
			$nonce = wp_create_nonce( 'quick-publish-action' ); 
			$link = admin_url( "edit.php?post_type=reply&update_id={$post->ID}&_wpnonce=$nonce" );
			$actions['publish'] = "<a href='$link'>Approve</a>";
		}   
	}
    return $actions;
},
10, 2 );


add_action( 'admin_init', function() 
{
    $nonce = isset( $_REQUEST['_wpnonce'] ) ? $_REQUEST['_wpnonce'] : null;
    if ( wp_verify_nonce( $nonce, 'quick-publish-action' ) && isset( $_REQUEST['update_id'] ) )
    {
        $my_post = array();
        $my_post['ID'] = $_REQUEST['update_id'];
        $my_post['post_status'] = 'publish';
        wp_update_post( $my_post );
    }
});
