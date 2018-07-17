<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;
use Carbon\Carbon;

class ApiController extends Controller
{
    public $api_url = "https://api.webflow.com";
    public $client;

    public function __construct() {
        $this->client = new Client([
            'headers' => [
                'Authorization' => 'Bearer da0e132dd3e41f5dfeb0ee1c7738410d8aa8f4b316440a4871a5b28fb3ac4929',
                'accept-version'     => '1.0.0'
            ]
        ]);
    }

    public function getCollection($collection_id) {
		$collections = [
            '5b027781dcae793de740d72d' => 'date',
			'5b0276490648400ceb2c0065' => 'date',
			'5b0276b7a41169bdcc11c480' => 'date'
        ];
	
		$response = $this->client->request('GET', $this->api_url . "/collections/" . $collection_id . "/items");
        $object = json_decode($response->getBody());
        
        $firstDayThisWeek = Carbon::now()->startOfWeek();
        $lastDayThisWeek = Carbon::parse($firstDayThisWeek)->addDay(7);
		
		if (! empty(request()->date)) {
			$firstDayThisWeek = Carbon::parse(request()->date)->startOfWeek();
			$lastDayThisWeek = Carbon::parse($firstDayThisWeek)->addDay(7);
		}
		
        $fieldFilter = isset($collections[$collection_id]) ? $collections[$collection_id] : 'published-on';

		$response = [];
		$response['items'] = collect($object->items)->filter(function($item) use ($fieldFilter, $firstDayThisWeek, $lastDayThisWeek) {
            
            $publishOn = Carbon::parse($item->{$fieldFilter});
			
            if($publishOn->between($firstDayThisWeek, $lastDayThisWeek, false)) {
				return true;
			}
			return false;
		});
		
		collect($response['items'])->map(function($item){
			$item->date = Carbon::parse($item->date)->format('Y-m-d');
			return $item;
		});
		
		$response['collection_id'] = $collection_id;
		return response()->json($response);
    }

    public function getAllCollections(Request $request) {
        $response = $this->client->request('GET', $this->api_url . "/sites/5aab9007b2d9ac9d254bd764/collections");
        return response()->json(json_decode($response->getBody()));
    }
}
