<?php
/**
 * Unit tests covering WP_REST_Block_Pattern_Categories_Controller functionality.
 *
 * @package WordPress
 * @subpackage REST_API
 */

/**
 * Unit tests for REST API for Block Pattern Categories.
 *
 * @group restapi
 * @covers WP_REST_Block_Pattern_Categories_Controller
 */
class WP_REST_Block_Pattern_Categories_Controller_Test extends WP_Test_REST_Controller_Testcase {
	protected static $admin_id;
	protected static $orig_registry;

	public function set_up() {
		parent::set_up();
		switch_theme( 'emptytheme' );
	}

	public static function wpSetupBeforeClass( $factory ) {
		// Create a test user.
		self::$admin_id = $factory->user->create( array( 'role' => 'administrator' ) );

		// Setup an empty testing instance of `WP_Block_Pattern_Categories_Registry` and save the original.
		$reflection = new ReflectionClass( 'WP_Block_Pattern_Categories_Registry' );
		$reflection->getProperty( 'instance' )->setAccessible( true );
		self::$orig_registry = $reflection->getStaticPropertyValue( 'instance' );
		$test_registry       = new WP_Block_Pattern_Categories_Registry();
		$reflection->setStaticPropertyValue( 'instance', $test_registry );

		// Register some categories in the test registry.
		$test_registry->register( 'test', array( 'label' => 'Test' ) );
		$test_registry->register( 'query', array( 'label' => 'Query' ) );
	}

	public static function wpTearDownAfterClass() {
		// Delete the test user.
		self::delete_user( self::$admin_id );

		// Restore the original registry instance.
		$reflection = new ReflectionClass( 'WP_Block_Pattern_Categories_Registry' );
		$reflection->setStaticPropertyValue( 'instance', self::$orig_registry );
	}

	public function test_register_routes() {
		$routes = rest_get_server()->get_routes();
		$this->assertArrayHasKey(
			'/__experimental/block-patterns/categories',
			$routes,
			'The categories route does not exist'
		);
	}

	public function test_get_items() {
		wp_set_current_user( self::$admin_id );

		$expected_names  = array( 'test', 'query' );
		$expected_fields = array( 'name', 'label' );

		$request            = new WP_REST_Request( 'GET', '/__experimental/block-patterns/categories' );
		$request['_fields'] = 'name,label';
		$response           = rest_get_server()->dispatch( $request );
		$data               = $response->get_data();

		$this->assertCount( count( $expected_names ), $data );
		foreach ( $data as $idx => $item ) {
			$this->assertEquals( $expected_names[ $idx ], $item['name'] );
			$this->assertEquals( $expected_fields, array_keys( $item ) );
		}
	}

	/**
	 * Abstract methods that we must implement.
	 */
	public function test_context_param() {}
	public function test_get_item() {}
	public function test_create_item() {}
	public function test_update_item() {}
	public function test_delete_item() {}
	public function test_prepare_item() {}
	public function test_get_item_schema() {}
}
