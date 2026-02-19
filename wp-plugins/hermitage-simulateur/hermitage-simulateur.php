<?php
/**
 * Plugin Name: Hermitage Simulateur
 * Description: Gestion des types de contenus, taxonomies et champs ACF pour le simulateur de sejours de L'Hermitage.
 * Version: 1.0.0
 * Author: L'Hermitage
 * Text Domain: hermitage-simulateur
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 7.4
 *
 * @package HermitageSimulateur
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * -------------------------------------------------------------------------
 * 0. Parent Admin Menu: Reservations
 * -------------------------------------------------------------------------
 */
add_action( 'admin_menu', 'hermitage_register_reservations_menu' );

function hermitage_register_reservations_menu() {
	add_menu_page(
		'Reservations',
		'Reservations',
		'edit_posts',
		'hermitage-reservations',
		'',
		'dashicons-calendar-alt',
		5
	);
}

/**
 * -------------------------------------------------------------------------
 * 1. Custom Post Type: sejour_template
 * -------------------------------------------------------------------------
 */
add_action( 'init', 'hermitage_register_sejour_template_cpt' );

function hermitage_register_sejour_template_cpt() {

	$labels = array(
		'name'                  => 'Modeles de sejour',
		'singular_name'         => 'Modele de sejour',
		'menu_name'             => 'Modeles de sejour',
		'name_admin_bar'        => 'Modele de sejour',
		'add_new'               => 'Ajouter',
		'add_new_item'          => 'Ajouter un modele de sejour',
		'new_item'              => 'Nouveau modele de sejour',
		'edit_item'             => 'Modifier le modele de sejour',
		'view_item'             => 'Voir le modele de sejour',
		'all_items'             => 'Tous les modeles',
		'search_items'          => 'Rechercher un modele',
		'parent_item_colon'     => 'Modele parent :',
		'not_found'             => 'Aucun modele trouve.',
		'not_found_in_trash'    => 'Aucun modele dans la corbeille.',
		'archives'              => 'Archives des modeles',
		'insert_into_item'      => 'Inserer dans le modele',
		'uploaded_to_this_item' => 'Importe pour ce modele',
		'filter_items_list'     => 'Filtrer les modeles',
		'items_list_navigation' => 'Navigation des modeles',
		'items_list'            => 'Liste des modeles',
	);

	$args = array(
		'labels'              => $labels,
		'public'              => true,
		'publicly_queryable'  => true,
		'show_ui'             => true,
		'show_in_menu'        => 'hermitage-reservations',
		'show_in_rest'        => true,
		'query_var'           => true,
		'rewrite'             => array( 'slug' => 'sejour-template' ),
		'capability_type'     => 'post',
		'has_archive'         => true,
		'hierarchical'        => false,
		'supports'            => array( 'title', 'editor', 'thumbnail', 'excerpt', 'revisions' ),
		'show_in_graphql'     => true,
		'graphql_single_name' => 'sejourTemplate',
		'graphql_plural_name' => 'sejourTemplates',
	);

	register_post_type( 'sejour_template', $args );
}

/**
 * -------------------------------------------------------------------------
 * 2. Hierarchical Taxonomies
 * -------------------------------------------------------------------------
 */
add_action( 'init', 'hermitage_register_taxonomies' );

function hermitage_register_taxonomies() {

	/* --- sejour_category (sejour_template) --- */
	register_taxonomy( 'sejour_category', array( 'sejour_template' ), array(
		'labels'              => array(
			'name'              => 'Categories de sejour',
			'singular_name'     => 'Categorie de sejour',
			'search_items'      => 'Rechercher des categories',
			'all_items'         => 'Toutes les categories',
			'parent_item'       => 'Categorie parente',
			'parent_item_colon' => 'Categorie parente :',
			'edit_item'         => 'Modifier la categorie',
			'update_item'       => 'Mettre a jour la categorie',
			'add_new_item'      => 'Ajouter une categorie',
			'new_item_name'     => 'Nom de la nouvelle categorie',
			'menu_name'         => 'Categories de sejour',
		),
		'hierarchical'        => true,
		'public'              => true,
		'show_ui'             => true,
		'show_admin_column'   => true,
		'show_in_rest'        => true,
		'rewrite'             => array( 'slug' => 'sejour-category' ),
		'show_in_graphql'     => true,
		'graphql_single_name' => 'sejourCategory',
		'graphql_plural_name' => 'sejourCategories',
	) );

	/* --- activite_type (activite) --- */
	register_taxonomy( 'activite_type', array( 'activite' ), array(
		'labels'              => array(
			'name'              => 'Types d\'activite',
			'singular_name'     => 'Type d\'activite',
			'search_items'      => 'Rechercher des types',
			'all_items'         => 'Tous les types',
			'parent_item'       => 'Type parent',
			'parent_item_colon' => 'Type parent :',
			'edit_item'         => 'Modifier le type',
			'update_item'       => 'Mettre a jour le type',
			'add_new_item'      => 'Ajouter un type',
			'new_item_name'     => 'Nom du nouveau type',
			'menu_name'         => 'Types d\'activite',
		),
		'hierarchical'        => true,
		'public'              => true,
		'show_ui'             => true,
		'show_admin_column'   => true,
		'show_in_rest'        => true,
		'rewrite'             => array( 'slug' => 'activite-type' ),
		'show_in_graphql'     => true,
		'graphql_single_name' => 'activiteType',
		'graphql_plural_name' => 'activiteTypes',
	) );

	/* --- espace_type (espace-de-travail) --- */
	register_taxonomy( 'espace_type', array( 'espace-de-travail' ), array(
		'labels'              => array(
			'name'              => 'Types d\'espace',
			'singular_name'     => 'Type d\'espace',
			'search_items'      => 'Rechercher des types',
			'all_items'         => 'Tous les types',
			'parent_item'       => 'Type parent',
			'parent_item_colon' => 'Type parent :',
			'edit_item'         => 'Modifier le type',
			'update_item'       => 'Mettre a jour le type',
			'add_new_item'      => 'Ajouter un type',
			'new_item_name'     => 'Nom du nouveau type',
			'menu_name'         => 'Types d\'espace',
		),
		'hierarchical'        => true,
		'public'              => true,
		'show_ui'             => true,
		'show_admin_column'   => true,
		'show_in_rest'        => true,
		'rewrite'             => array( 'slug' => 'espace-type' ),
		'show_in_graphql'     => true,
		'graphql_single_name' => 'espaceType',
		'graphql_plural_name' => 'espaceTypes',
	) );

	/* --- hebergement_type (hebergement) --- */
	register_taxonomy( 'hebergement_type', array( 'hebergement' ), array(
		'labels'              => array(
			'name'              => 'Types d\'hebergement',
			'singular_name'     => 'Type d\'hebergement',
			'search_items'      => 'Rechercher des types',
			'all_items'         => 'Tous les types',
			'parent_item'       => 'Type parent',
			'parent_item_colon' => 'Type parent :',
			'edit_item'         => 'Modifier le type',
			'update_item'       => 'Mettre a jour le type',
			'add_new_item'      => 'Ajouter un type',
			'new_item_name'     => 'Nom du nouveau type',
			'menu_name'         => 'Types d\'hebergement',
		),
		'hierarchical'        => true,
		'public'              => true,
		'show_ui'             => true,
		'show_admin_column'   => true,
		'show_in_rest'        => true,
		'rewrite'             => array( 'slug' => 'hebergement-type' ),
		'show_in_graphql'     => true,
		'graphql_single_name' => 'hebergementType',
		'graphql_plural_name' => 'hebergementTypes',
	) );

	/* --- service_category (service) --- */
	register_taxonomy( 'service_category', array( 'service' ), array(
		'labels'              => array(
			'name'              => 'Categories de service',
			'singular_name'     => 'Categorie de service',
			'search_items'      => 'Rechercher des categories',
			'all_items'         => 'Toutes les categories',
			'parent_item'       => 'Categorie parente',
			'parent_item_colon' => 'Categorie parente :',
			'edit_item'         => 'Modifier la categorie',
			'update_item'       => 'Mettre a jour la categorie',
			'add_new_item'      => 'Ajouter une categorie',
			'new_item_name'     => 'Nom de la nouvelle categorie',
			'menu_name'         => 'Categories de service',
		),
		'hierarchical'        => true,
		'public'              => true,
		'show_ui'             => true,
		'show_admin_column'   => true,
		'show_in_rest'        => true,
		'rewrite'             => array( 'slug' => 'service-category' ),
		'show_in_graphql'     => true,
		'graphql_single_name' => 'serviceCategory',
		'graphql_plural_name' => 'serviceCategories',
	) );
}

/**
 * -------------------------------------------------------------------------
 * 3. ACF Field Groups
 * -------------------------------------------------------------------------
 */
add_action( 'acf/init', 'hermitage_register_acf_fields' );

function hermitage_register_acf_fields() {

	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}

	/* =====================================================================
	 * 3a. Activite Simulateur
	 * =================================================================== */
	acf_add_local_field_group( array(
		'key'                   => 'group_activite_simulateur',
		'title'                 => 'Activite Simulateur',
		'fields'                => array(
			array(
				'key'               => 'field_act_duree_minutes',
				'label'             => 'Duree (minutes)',
				'name'              => 'duree_minutes',
				'type'              => 'number',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_act_capacite_min',
				'label'             => 'Capacite minimum',
				'name'              => 'capacite_min',
				'type'              => 'number',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_act_capacite_max',
				'label'             => 'Capacite maximum',
				'name'              => 'capacite_max',
				'type'              => 'number',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_act_prix_par_personne',
				'label'             => 'Prix par personne',
				'name'              => 'prix_par_personne',
				'type'              => 'number',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_act_prix_forfaitaire',
				'label'             => 'Prix forfaitaire',
				'name'              => 'prix_forfaitaire',
				'type'              => 'number',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_act_mode_tarification',
				'label'             => 'Mode de tarification',
				'name'              => 'mode_tarification',
				'type'              => 'select',
				'show_in_graphql'   => 1,
				'choices'           => array(
					'par_personne' => 'Par personne',
					'forfaitaire'  => 'Forfaitaire',
				),
			),
			array(
				'key'               => 'field_act_creneau_suggere',
				'label'             => 'Creneau suggere',
				'name'              => 'creneau_suggere',
				'type'              => 'select',
				'show_in_graphql'   => 1,
				'choices'           => array(
					'matin'      => 'Matin',
					'apres_midi' => 'Apres-midi',
					'soiree'     => 'Soiree',
					'journee'    => 'Journee',
				),
			),
			array(
				'key'               => 'field_act_creneaux_disponibles',
				'label'             => 'Creneaux disponibles',
				'name'              => 'creneaux_disponibles',
				'type'              => 'checkbox',
				'show_in_graphql'   => 1,
				'instructions'      => 'Cochez les creneaux horaires ou cette activite peut etre proposee.',
				'choices'           => array(
					'petit_dejeuner' => 'Petit dejeuner',
					'matin'          => 'Matin',
					'dejeuner'       => 'Dejeuner',
					'apres_midi'     => 'Apres-midi',
					'diner'          => 'Diner',
					'soir'           => 'Soir',
				),
			),
			array(
				'key'               => 'field_act_description_immersive',
				'label'             => 'Description immersive',
				'name'              => 'description_immersive',
				'type'              => 'wysiwyg',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_act_galerie',
				'label'             => 'Galerie',
				'name'              => 'galerie',
				'type'              => 'gallery',
				'show_in_graphql'   => 1,
				'return_format'     => 'array',
			),
			array(
				'key'               => 'field_act_video_teaser_url',
				'label'             => 'URL video teaser',
				'name'              => 'video_teaser_url',
				'type'              => 'url',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_act_niveau_physique',
				'label'             => 'Niveau physique',
				'name'              => 'niveau_physique',
				'type'              => 'select',
				'show_in_graphql'   => 1,
				'choices'           => array(
					'faible'  => 'Faible',
					'modere'  => 'Modere',
					'intense' => 'Intense',
				),
			),
			array(
				'key'               => 'field_act_interieur_exterieur',
				'label'             => 'Interieur / Exterieur',
				'name'              => 'interieur_exterieur',
				'type'              => 'select',
				'show_in_graphql'   => 1,
				'choices'           => array(
					'interieur' => 'Interieur',
					'exterieur' => 'Exterieur',
					'les_deux'  => 'Les deux',
				),
			),
			array(
				'key'               => 'field_act_coordonnees_plan',
				'label'             => 'Coordonnees sur le plan',
				'name'              => 'coordonnees_plan',
				'type'              => 'group',
				'show_in_graphql'   => 1,
				'sub_fields'        => array(
					array(
						'key'             => 'field_act_coord_x',
						'label'           => 'X',
						'name'            => 'x',
						'type'            => 'number',
						'show_in_graphql' => 1,
					),
					array(
						'key'             => 'field_act_coord_y',
						'label'           => 'Y',
						'name'            => 'y',
						'type'            => 'number',
						'show_in_graphql' => 1,
					),
				),
			),
		),
		'location'              => array(
			array(
				array(
					'param'    => 'post_type',
					'operator' => '==',
					'value'    => 'activite',
				),
			),
		),
		'show_in_graphql'       => 1,
		'graphql_field_name'    => 'activiteSimulateur',
	) );

	/* =====================================================================
	 * 3b. Hebergement Simulateur
	 * =================================================================== */
	acf_add_local_field_group( array(
		'key'                   => 'group_hebergement_simulateur',
		'title'                 => 'Hebergement Simulateur',
		'fields'                => array(
			array(
				'key'               => 'field_heb_capacite_personnes',
				'label'             => 'Capacite (personnes)',
				'name'              => 'capacite_personnes',
				'type'              => 'number',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_heb_nombre_unites',
				'label'             => 'Nombre d\'unites',
				'name'              => 'nombre_unites',
				'type'              => 'number',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_heb_prix_nuit_unite',
				'label'             => 'Prix par nuit par unite',
				'name'              => 'prix_nuit_unite',
				'type'              => 'number',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_heb_niveau_confort',
				'label'             => 'Niveau de confort',
				'name'              => 'niveau_confort',
				'type'              => 'select',
				'show_in_graphql'   => 1,
				'choices'           => array(
					'standard' => 'Standard',
					'confort'  => 'Confort',
					'premium'  => 'Premium',
				),
			),
			array(
				'key'               => 'field_heb_equipements_chambre',
				'label'             => 'Equipements chambre',
				'name'              => 'equipements_chambre',
				'type'              => 'checkbox',
				'show_in_graphql'   => 1,
				'choices'           => array(
					'climatisation'  => 'Climatisation',
					'sdb_privative'  => 'Salle de bain privative',
					'wifi'           => 'Wi-Fi',
					'tv'             => 'TV',
					'minibar'        => 'Minibar',
					'terrasse'       => 'Terrasse',
					'vue_parc'       => 'Vue sur le parc',
				),
			),
			array(
				'key'               => 'field_heb_description_immersive',
				'label'             => 'Description immersive',
				'name'              => 'description_immersive',
				'type'              => 'wysiwyg',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_heb_galerie',
				'label'             => 'Galerie',
				'name'              => 'galerie',
				'type'              => 'gallery',
				'show_in_graphql'   => 1,
				'return_format'     => 'array',
			),
			array(
				'key'               => 'field_heb_coordonnees_plan',
				'label'             => 'Coordonnees sur le plan',
				'name'              => 'coordonnees_plan',
				'type'              => 'group',
				'show_in_graphql'   => 1,
				'sub_fields'        => array(
					array(
						'key'             => 'field_heb_coord_x',
						'label'           => 'X',
						'name'            => 'x',
						'type'            => 'number',
						'show_in_graphql' => 1,
					),
					array(
						'key'             => 'field_heb_coord_y',
						'label'           => 'Y',
						'name'            => 'y',
						'type'            => 'number',
						'show_in_graphql' => 1,
					),
				),
			),
			array(
				'key'               => 'field_heb_zone_plan_svg_id',
				'label'             => 'Zone plan SVG ID',
				'name'              => 'zone_plan_svg_id',
				'type'              => 'text',
				'show_in_graphql'   => 1,
			),
		),
		'location'              => array(
			array(
				array(
					'param'    => 'post_type',
					'operator' => '==',
					'value'    => 'hebergement',
				),
			),
		),
		'show_in_graphql'       => 1,
		'graphql_field_name'    => 'hebergementSimulateur',
	) );

	/* =====================================================================
	 * 3c. Espace Simulateur
	 * =================================================================== */
	acf_add_local_field_group( array(
		'key'                   => 'group_espace_simulateur',
		'title'                 => 'Espace Simulateur',
		'fields'                => array(
			array(
				'key'               => 'field_esp_capacite_max',
				'label'             => 'Capacite maximum',
				'name'              => 'capacite_max',
				'type'              => 'number',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_esp_superficie_m2',
				'label'             => 'Superficie (m2)',
				'name'              => 'superficie_m2',
				'type'              => 'number',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_esp_privatisable',
				'label'             => 'Privatisable',
				'name'              => 'privatisable',
				'type'              => 'true_false',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_esp_prix_privatisation_journee',
				'label'             => 'Prix privatisation (journee)',
				'name'              => 'prix_privatisation_journee',
				'type'              => 'number',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_esp_equipements',
				'label'             => 'Equipements',
				'name'              => 'equipements',
				'type'              => 'checkbox',
				'show_in_graphql'   => 1,
				'choices'           => array(
					'videoprojecteur'    => 'Videoprojecteur',
					'paperboard'         => 'Paperboard',
					'wifi_fibre'         => 'Wi-Fi fibre',
					'sonorisation'       => 'Sonorisation',
					'ecran_geant'        => 'Ecran geant',
					'mobilier_modulable' => 'Mobilier modulable',
					'cuisine_equipee'    => 'Cuisine equipee',
				),
			),
			array(
				'key'               => 'field_esp_ambiance',
				'label'             => 'Ambiance',
				'name'              => 'ambiance',
				'type'              => 'select',
				'show_in_graphql'   => 1,
				'choices'           => array(
					'professionnel' => 'Professionnel',
					'decontracte'   => 'Decontracte',
					'intimiste'     => 'Intimiste',
					'festif'        => 'Festif',
				),
			),
			array(
				'key'               => 'field_esp_description_immersive',
				'label'             => 'Description immersive',
				'name'              => 'description_immersive',
				'type'              => 'wysiwyg',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_esp_galerie',
				'label'             => 'Galerie',
				'name'              => 'galerie',
				'type'              => 'gallery',
				'show_in_graphql'   => 1,
				'return_format'     => 'array',
			),
			array(
				'key'               => 'field_esp_vue_360_url',
				'label'             => 'URL vue 360',
				'name'              => 'vue_360_url',
				'type'              => 'url',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_esp_coordonnees_plan',
				'label'             => 'Coordonnees sur le plan',
				'name'              => 'coordonnees_plan',
				'type'              => 'group',
				'show_in_graphql'   => 1,
				'sub_fields'        => array(
					array(
						'key'             => 'field_esp_coord_x',
						'label'           => 'X',
						'name'            => 'x',
						'type'            => 'number',
						'show_in_graphql' => 1,
					),
					array(
						'key'             => 'field_esp_coord_y',
						'label'           => 'Y',
						'name'            => 'y',
						'type'            => 'number',
						'show_in_graphql' => 1,
					),
				),
			),
			array(
				'key'               => 'field_esp_zone_plan_svg_id',
				'label'             => 'Zone plan SVG ID',
				'name'              => 'zone_plan_svg_id',
				'type'              => 'text',
				'show_in_graphql'   => 1,
			),
		),
		'location'              => array(
			array(
				array(
					'param'    => 'post_type',
					'operator' => '==',
					'value'    => 'espace-de-travail',
				),
			),
		),
		'show_in_graphql'       => 1,
		'graphql_field_name'    => 'espaceSimulateur',
	) );

	/* =====================================================================
	 * 3d. Service Simulateur
	 * =================================================================== */
	acf_add_local_field_group( array(
		'key'                   => 'group_service_simulateur',
		'title'                 => 'Service Simulateur',
		'fields'                => array(
			array(
				'key'               => 'field_srv_prix_par_personne',
				'label'             => 'Prix par personne',
				'name'              => 'prix_par_personne',
				'type'              => 'number',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_srv_prix_forfaitaire',
				'label'             => 'Prix forfaitaire',
				'name'              => 'prix_forfaitaire',
				'type'              => 'number',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_srv_mode_tarification',
				'label'             => 'Mode de tarification',
				'name'              => 'mode_tarification',
				'type'              => 'select',
				'show_in_graphql'   => 1,
				'choices'           => array(
					'par_personne' => 'Par personne',
					'forfaitaire'  => 'Forfaitaire',
				),
			),
			array(
				'key'               => 'field_srv_inclus_par_defaut',
				'label'             => 'Inclus par defaut',
				'name'              => 'inclus_par_defaut',
				'type'              => 'true_false',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_srv_creneaux_disponibles',
				'label'             => 'Creneaux disponibles',
				'name'              => 'creneaux_disponibles',
				'type'              => 'checkbox',
				'show_in_graphql'   => 1,
				'instructions'      => 'Cochez les creneaux horaires ou ce service peut etre propose.',
				'choices'           => array(
					'petit_dejeuner' => 'Petit dejeuner',
					'matin'          => 'Matin',
					'dejeuner'       => 'Dejeuner',
					'apres_midi'     => 'Apres-midi',
					'diner'          => 'Diner',
					'soir'           => 'Soir',
				),
			),
			array(
				'key'               => 'field_srv_description_courte',
				'label'             => 'Description courte',
				'name'              => 'description_courte',
				'type'              => 'text',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_srv_description_immersive',
				'label'             => 'Description immersive',
				'name'              => 'description_immersive',
				'type'              => 'wysiwyg',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_srv_galerie',
				'label'             => 'Galerie',
				'name'              => 'galerie',
				'type'              => 'gallery',
				'show_in_graphql'   => 1,
				'return_format'     => 'array',
			),
			array(
				'key'               => 'field_srv_options',
				'label'             => 'Options',
				'name'              => 'options',
				'type'              => 'repeater',
				'show_in_graphql'   => 1,
				'layout'            => 'table',
				'sub_fields'        => array(
					array(
						'key'             => 'field_srv_option_nom',
						'label'           => 'Nom',
						'name'            => 'nom',
						'type'            => 'text',
						'show_in_graphql' => 1,
					),
					array(
						'key'             => 'field_srv_option_supplement',
						'label'           => 'Supplement par personne',
						'name'            => 'supplement_par_personne',
						'type'            => 'number',
						'show_in_graphql' => 1,
					),
				),
			),
		),
		'location'              => array(
			array(
				array(
					'param'    => 'post_type',
					'operator' => '==',
					'value'    => 'service',
				),
			),
		),
		'show_in_graphql'       => 1,
		'graphql_field_name'    => 'serviceSimulateur',
	) );

	/* =====================================================================
	 * 3e. Sejour Template Fields
	 * =================================================================== */
	acf_add_local_field_group( array(
		'key'                   => 'group_sejour_template',
		'title'                 => 'Sejour Template',
		'fields'                => array(
			array(
				'key'               => 'field_st_duree_jours',
				'label'             => 'Duree (jours)',
				'name'              => 'duree_jours',
				'type'              => 'number',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_st_description_promesse',
				'label'             => 'Description promesse',
				'name'              => 'description_promesse',
				'type'              => 'textarea',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_st_image_hero',
				'label'             => 'Image hero',
				'name'              => 'image_hero',
				'type'              => 'image',
				'show_in_graphql'   => 1,
				'return_format'     => 'array',
			),
			array(
				'key'               => 'field_st_programme_defaut',
				'label'             => 'Programme par defaut',
				'name'              => 'programme_defaut',
				'type'              => 'repeater',
				'show_in_graphql'   => 1,
				'layout'            => 'block',
				'sub_fields'        => array(
					array(
						'key'             => 'field_st_jour_numero',
						'label'           => 'Jour numero',
						'name'            => 'jour_numero',
						'type'            => 'number',
						'show_in_graphql' => 1,
					),
					array(
						'key'             => 'field_st_creneaux',
						'label'           => 'Creneaux',
						'name'            => 'creneaux',
						'type'            => 'repeater',
						'show_in_graphql' => 1,
						'layout'          => 'row',
						'sub_fields'      => array(
							array(
								'key'             => 'field_st_creneau',
								'label'           => 'Créneau',
								'name'            => 'creneau',
								'type'            => 'select',
								'show_in_graphql' => 1,
								'choices'         => array(
									'petit_dejeuner' => 'Petit déjeuner',
									'matin'          => 'Matin',
									'dejeuner'       => 'Déjeuner',
									'apres_midi'     => 'Après-midi',
									'diner'          => 'Dîner',
									'soir'           => 'Soir',
								),
								'default_value'   => 'matin',
							),
							array(
								'key'             => 'field_st_activite_suggeree',
								'label'           => 'Activite suggeree',
								'name'            => 'activite_suggeree',
								'type'            => 'post_object',
								'show_in_graphql' => 1,
								'post_type'       => array( 'activite' ),
								'return_format'   => 'id',
								'allow_null'      => 1,
							),
							array(
								'key'             => 'field_st_espace_suggere',
								'label'           => 'Espace suggere',
								'name'            => 'espace_suggere',
								'type'            => 'post_object',
								'show_in_graphql' => 1,
								'post_type'       => array( 'espace-de-travail' ),
								'return_format'   => 'id',
								'allow_null'      => 1,
							),
							array(
								'key'             => 'field_st_service_suggere',
								'label'           => 'Service suggere',
								'name'            => 'service_suggere',
								'type'            => 'post_object',
								'show_in_graphql' => 1,
								'post_type'       => array( 'service' ),
								'return_format'   => 'id',
								'allow_null'      => 1,
							),
							array(
								'key'             => 'field_st_label_personnalise',
								'label'           => 'Label personnalise',
								'name'            => 'label_personnalise',
								'type'            => 'text',
								'show_in_graphql' => 1,
							),
						),
					),
				),
			),
		),
		'location'              => array(
			array(
				array(
					'param'    => 'post_type',
					'operator' => '==',
					'value'    => 'sejour_template',
				),
			),
		),
		'show_in_graphql'       => 1,
		'graphql_field_name'    => 'sejourTemplateFields',
	) );

	/* =====================================================================
	 * 3f. ACF Options Page - Simulateur Settings
	 * =================================================================== */
	if ( function_exists( 'acf_add_options_page' ) ) {
		acf_add_options_page( array(
			'page_title'        => 'Reglages du Simulateur',
			'menu_title'        => 'Simulateur',
			'menu_slug'         => 'simulateur-settings',
			'parent_slug'       => 'hermitage-reservations',
			'capability'        => 'manage_options',
			'redirect'          => false,
			'show_in_graphql'   => true,
			'graphql_field_name' => 'simulateurSettings',
		) );
	}

	acf_add_local_field_group( array(
		'key'                   => 'group_simulateur_settings',
		'title'                 => 'Simulateur Settings',
		'fields'                => array(
			array(
				'key'               => 'field_ss_nom_lieu',
				'label'             => 'Nom du lieu',
				'name'              => 'nom_lieu',
				'type'              => 'text',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_ss_description_lieu',
				'label'             => 'Description du lieu',
				'name'              => 'description_lieu',
				'type'              => 'wysiwyg',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_ss_plan_domaine_svg',
				'label'             => 'Plan du domaine (SVG)',
				'name'              => 'plan_domaine_svg',
				'type'              => 'file',
				'show_in_graphql'   => 1,
				'return_format'     => 'array',
			),
			array(
				'key'               => 'field_ss_capacite_totale_max',
				'label'             => 'Capacite totale maximum',
				'name'              => 'capacite_totale_max',
				'type'              => 'number',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_ss_prix_base_journee_personne',
				'label'             => 'Prix de base par journee par personne',
				'name'              => 'prix_base_journee_personne',
				'type'              => 'number',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_ss_coefficient_weekend',
				'label'             => 'Coefficient weekend',
				'name'              => 'coefficient_weekend',
				'type'              => 'number',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_ss_coefficient_haute_saison',
				'label'             => 'Coefficient haute saison',
				'name'              => 'coefficient_haute_saison',
				'type'              => 'number',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_ss_periodes_haute_saison',
				'label'             => 'Periodes de haute saison',
				'name'              => 'periodes_haute_saison',
				'type'              => 'repeater',
				'show_in_graphql'   => 1,
				'layout'            => 'table',
				'sub_fields'        => array(
					array(
						'key'             => 'field_ss_date_debut',
						'label'           => 'Date de debut',
						'name'            => 'date_debut',
						'type'            => 'date_picker',
						'show_in_graphql' => 1,
						'display_format'  => 'd/m/Y',
						'return_format'   => 'Y-m-d',
					),
					array(
						'key'             => 'field_ss_date_fin',
						'label'           => 'Date de fin',
						'name'            => 'date_fin',
						'type'            => 'date_picker',
						'show_in_graphql' => 1,
						'display_format'  => 'd/m/Y',
						'return_format'   => 'Y-m-d',
					),
				),
			),
			array(
				'key'               => 'field_ss_email_commercial',
				'label'             => 'Email commercial',
				'name'              => 'email_commercial',
				'type'              => 'email',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_ss_telephone_commercial',
				'label'             => 'Telephone commercial',
				'name'              => 'telephone_commercial',
				'type'              => 'text',
				'show_in_graphql'   => 1,
			),
			array(
				'key'               => 'field_ss_equipements_disponibles',
				'label'             => 'Equipements disponibles',
				'name'              => 'equipements_disponibles',
				'type'              => 'repeater',
				'show_in_graphql'   => 1,
				'layout'            => 'table',
				'instructions'      => 'Definir les equipements selectionnables pour les espaces de travail.',
				'button_label'      => 'Ajouter un equipement',
				'sub_fields'        => array(
					array(
						'key'             => 'field_ss_eq_slug',
						'label'           => 'Slug',
						'name'            => 'slug',
						'type'            => 'text',
						'show_in_graphql' => 1,
						'required'        => 1,
						'instructions'    => 'Identifiant unique (ex: wifi_fibre)',
					),
					array(
						'key'             => 'field_ss_eq_label',
						'label'           => 'Label',
						'name'            => 'label',
						'type'            => 'text',
						'show_in_graphql' => 1,
						'required'        => 1,
						'instructions'    => 'Nom affiche (ex: Wi-Fi fibre)',
					),
				),
			),
			array(
				'key'               => 'field_ss_ambiances_disponibles',
				'label'             => 'Ambiances disponibles',
				'name'              => 'ambiances_disponibles',
				'type'              => 'repeater',
				'show_in_graphql'   => 1,
				'layout'            => 'table',
				'instructions'      => 'Definir les ambiances selectionnables pour les espaces de travail.',
				'button_label'      => 'Ajouter une ambiance',
				'sub_fields'        => array(
					array(
						'key'             => 'field_ss_amb_slug',
						'label'           => 'Slug',
						'name'            => 'slug',
						'type'            => 'text',
						'show_in_graphql' => 1,
						'required'        => 1,
						'instructions'    => 'Identifiant unique (ex: professionnel)',
					),
					array(
						'key'             => 'field_ss_amb_label',
						'label'           => 'Label',
						'name'            => 'label',
						'type'            => 'text',
						'show_in_graphql' => 1,
						'required'        => 1,
						'instructions'    => 'Nom affiche (ex: Professionnel)',
					),
				),
			),
		),
		'location'              => array(
			array(
				array(
					'param'    => 'options_page',
					'operator' => '==',
					'value'    => 'simulateur-settings',
				),
			),
		),
		'show_in_graphql'       => 1,
		'graphql_field_name'    => 'simulateurSettings',
	) );
}

/**
 * -------------------------------------------------------------------------
 * 3bis. Dynamic ACF field choices from settings repeaters
 * -------------------------------------------------------------------------
 */

add_filter( 'acf/load_field/key=field_esp_equipements', 'hermitage_load_equipements_choices' );

function hermitage_load_equipements_choices( $field ) {
	$rows = get_field( 'equipements_disponibles', 'option' );
	if ( ! empty( $rows ) && is_array( $rows ) ) {
		$choices = array();
		foreach ( $rows as $row ) {
			if ( ! empty( $row['slug'] ) && ! empty( $row['label'] ) ) {
				$choices[ $row['slug'] ] = $row['label'];
			}
		}
		if ( ! empty( $choices ) ) {
			$field['choices'] = $choices;
		}
	}
	return $field;
}

add_filter( 'acf/load_field/key=field_esp_ambiance', 'hermitage_load_ambiances_choices' );

function hermitage_load_ambiances_choices( $field ) {
	$rows = get_field( 'ambiances_disponibles', 'option' );
	if ( ! empty( $rows ) && is_array( $rows ) ) {
		$choices = array();
		foreach ( $rows as $row ) {
			if ( ! empty( $row['slug'] ) && ! empty( $row['label'] ) ) {
				$choices[ $row['slug'] ] = $row['label'];
			}
		}
		if ( ! empty( $choices ) ) {
			$field['choices'] = $choices;
		}
	}
	return $field;
}

/**
 * -------------------------------------------------------------------------
 * 4. Custom Post Type: demande_devis (admin-only)
 * -------------------------------------------------------------------------
 */
add_action( 'init', 'hermitage_register_demande_devis_cpt' );

function hermitage_register_demande_devis_cpt() {

	$labels = array(
		'name'               => 'Demandes de devis',
		'singular_name'      => 'Demande de devis',
		'menu_name'          => 'Demandes de devis',
		'name_admin_bar'     => 'Demande de devis',
		'all_items'          => 'Toutes les demandes',
		'search_items'       => 'Rechercher une demande',
		'not_found'          => 'Aucune demande trouvee.',
		'not_found_in_trash' => 'Aucune demande dans la corbeille.',
		'edit_item'          => 'Voir la demande de devis',
	);

	$args = array(
		'labels'              => $labels,
		'public'              => false,
		'publicly_queryable'  => false,
		'show_ui'             => true,
		'show_in_menu'        => 'hermitage-reservations',
		'show_in_rest'        => false,
		'query_var'           => false,
		'rewrite'             => false,
		'capability_type'     => 'post',
		'has_archive'         => false,
		'hierarchical'        => false,
		'supports'            => array( 'title' ),
	);

	register_post_type( 'demande_devis', $args );
}

/**
 * -------------------------------------------------------------------------
 * 5. REST API: POST /wp-json/hermitage-sim/v1/devis
 * -------------------------------------------------------------------------
 */
add_action( 'rest_api_init', 'hermitage_register_devis_rest_route' );

function hermitage_register_devis_rest_route() {
	register_rest_route( 'hermitage-sim/v1', '/devis', array(
		'methods'             => 'POST',
		'callback'            => 'hermitage_handle_devis_submission',
		'permission_callback' => '__return_true',
	) );
}

function hermitage_handle_devis_submission( WP_REST_Request $request ) {
	$body = $request->get_json_params();

	/* --- Validate required fields --- */
	$contact_name  = isset( $body['contact_name'] ) ? sanitize_text_field( $body['contact_name'] ) : '';
	$contact_email = isset( $body['contact_email'] ) ? sanitize_email( $body['contact_email'] ) : '';

	if ( empty( $contact_name ) || empty( $contact_email ) || ! is_email( $contact_email ) ) {
		return new WP_REST_Response( array(
			'success' => false,
			'error'   => 'Nom et email valides requis.',
		), 400 );
	}

	/* --- Sanitize optional fields --- */
	$contact_company = isset( $body['contact_company'] ) ? sanitize_text_field( $body['contact_company'] ) : '';
	$contact_phone   = isset( $body['contact_phone'] ) ? sanitize_text_field( $body['contact_phone'] ) : '';
	$message         = isset( $body['message'] ) ? sanitize_textarea_field( $body['message'] ) : '';
	$category        = isset( $body['category'] ) ? sanitize_text_field( $body['category'] ) : '';
	$group_size      = isset( $body['group_size'] ) ? absint( $body['group_size'] ) : 0;
	$duration        = isset( $body['duration'] ) ? absint( $body['duration'] ) : 0;
	$budget          = isset( $body['budget'] ) && is_array( $body['budget'] ) ? $body['budget'] : array();
	$selections      = isset( $body['selections'] ) && is_array( $body['selections'] ) ? $body['selections'] : array();

	$budget_total = isset( $budget['total'] ) ? floatval( $budget['total'] ) : 0;

	/* --- Create the post --- */
	$post_id = wp_insert_post( array(
		'post_type'   => 'demande_devis',
		'post_status' => 'publish',
		'post_title'  => sprintf( 'Devis – %s', $contact_name ),
	), true );

	if ( is_wp_error( $post_id ) ) {
		return new WP_REST_Response( array(
			'success' => false,
			'error'   => 'Erreur lors de l\'enregistrement.',
		), 500 );
	}

	/* --- Store meta --- */
	update_post_meta( $post_id, '_devis_contact_name', $contact_name );
	update_post_meta( $post_id, '_devis_contact_email', $contact_email );
	update_post_meta( $post_id, '_devis_contact_company', $contact_company );
	update_post_meta( $post_id, '_devis_contact_phone', $contact_phone );
	update_post_meta( $post_id, '_devis_message', $message );
	update_post_meta( $post_id, '_devis_category', $category );
	update_post_meta( $post_id, '_devis_group_size', $group_size );
	update_post_meta( $post_id, '_devis_duration', $duration );
	update_post_meta( $post_id, '_devis_budget_total', $budget_total );
	update_post_meta( $post_id, '_devis_budget_detail', wp_json_encode( $budget ) );
	update_post_meta( $post_id, '_devis_selections', wp_json_encode( $selections ) );
	update_post_meta( $post_id, '_devis_status', 'nouveau' );

	/* --- Send email notification --- */
	$email_to = '';
	if ( function_exists( 'get_field' ) ) {
		$email_to = get_field( 'email_commercial', 'option' );
	}
	if ( empty( $email_to ) ) {
		$email_to = get_option( 'admin_email' );
	}

	$subject = sprintf( '[L\'Hermitage] Nouvelle demande de devis – %s', $contact_name );
	$body_text = sprintf(
		"Nouvelle demande de devis depuis le simulateur.\n\n" .
		"Contact : %s\n" .
		"Email : %s\n" .
		"Entreprise : %s\n" .
		"Telephone : %s\n\n" .
		"Categorie : %s\n" .
		"Participants : %d\n" .
		"Duree : %d jour(s)\n" .
		"Budget estime : %s EUR\n\n" .
		"Message :\n%s\n\n" .
		"Voir le detail dans l'admin : %s",
		$contact_name,
		$contact_email,
		$contact_company ?: '—',
		$contact_phone ?: '—',
		$category ?: '—',
		$group_size,
		$duration,
		number_format( $budget_total, 0, ',', ' ' ),
		$message ?: '(aucun)',
		admin_url( 'post.php?post=' . $post_id . '&action=edit' )
	);

	$headers = array( 'Reply-To: ' . $contact_name . ' <' . $contact_email . '>' );
	wp_mail( $email_to, $subject, $body_text, $headers );

	return new WP_REST_Response( array(
		'success'  => true,
		'devis_id' => $post_id,
	), 201 );
}

/**
 * -------------------------------------------------------------------------
 * 6. Admin columns for demande_devis
 * -------------------------------------------------------------------------
 */
add_filter( 'manage_demande_devis_posts_columns', 'hermitage_devis_admin_columns' );

function hermitage_devis_admin_columns( $columns ) {
	$new = array();
	$new['cb']           = $columns['cb'];
	$new['title']        = 'Demande';
	$new['devis_email']  = 'Email';
	$new['devis_cat']    = 'Categorie';
	$new['devis_group']  = 'Participants';
	$new['devis_budget'] = 'Budget';
	$new['devis_status'] = 'Statut';
	$new['date']         = 'Date';
	return $new;
}

add_action( 'manage_demande_devis_posts_custom_column', 'hermitage_devis_admin_column_content', 10, 2 );

function hermitage_devis_admin_column_content( $column, $post_id ) {
	switch ( $column ) {
		case 'devis_email':
			$email = get_post_meta( $post_id, '_devis_contact_email', true );
			echo esc_html( $email );
			break;
		case 'devis_cat':
			echo esc_html( get_post_meta( $post_id, '_devis_category', true ) );
			break;
		case 'devis_group':
			echo esc_html( get_post_meta( $post_id, '_devis_group_size', true ) );
			break;
		case 'devis_budget':
			$total = get_post_meta( $post_id, '_devis_budget_total', true );
			if ( $total ) {
				echo esc_html( number_format( floatval( $total ), 0, ',', ' ' ) . ' EUR' );
			}
			break;
		case 'devis_status':
			$status = get_post_meta( $post_id, '_devis_status', true ) ?: 'nouveau';
			$labels = array(
				'nouveau'  => '<span style="color:#2271b1;font-weight:600;">Nouveau</span>',
				'en_cours' => '<span style="color:#dba617;font-weight:600;">En cours</span>',
				'traite'   => '<span style="color:#00a32a;font-weight:600;">Traite</span>',
				'refuse'   => '<span style="color:#d63638;font-weight:600;">Refuse</span>',
			);
			echo isset( $labels[ $status ] ) ? $labels[ $status ] : esc_html( $status );
			break;
	}
}

add_filter( 'manage_edit-demande_devis_sortable_columns', 'hermitage_devis_sortable_columns' );

function hermitage_devis_sortable_columns( $columns ) {
	$columns['devis_budget'] = 'devis_budget';
	return $columns;
}

add_action( 'pre_get_posts', 'hermitage_devis_orderby' );

function hermitage_devis_orderby( $query ) {
	if ( ! is_admin() || ! $query->is_main_query() ) return;
	if ( $query->get( 'post_type' ) !== 'demande_devis' ) return;

	if ( $query->get( 'orderby' ) === 'devis_budget' ) {
		$query->set( 'meta_key', '_devis_budget_total' );
		$query->set( 'orderby', 'meta_value_num' );
	}
}

/**
 * -------------------------------------------------------------------------
 * 7. Meta box: Devis detail (read-only) + status selector
 * -------------------------------------------------------------------------
 */
add_action( 'add_meta_boxes', 'hermitage_devis_add_meta_boxes' );

function hermitage_devis_add_meta_boxes() {
	add_meta_box(
		'hermitage_devis_detail',
		'Detail du devis',
		'hermitage_devis_meta_box_html',
		'demande_devis',
		'normal',
		'high'
	);

	add_meta_box(
		'hermitage_devis_status_box',
		'Statut de la demande',
		'hermitage_devis_status_meta_box_html',
		'demande_devis',
		'side',
		'high'
	);
}

function hermitage_devis_status_meta_box_html( $post ) {
	$status = get_post_meta( $post->ID, '_devis_status', true ) ?: 'nouveau';
	wp_nonce_field( 'hermitage_devis_status', 'hermitage_devis_status_nonce' );
	?>
	<select name="hermitage_devis_status" style="width:100%;">
		<option value="nouveau" <?php selected( $status, 'nouveau' ); ?>>Nouveau</option>
		<option value="en_cours" <?php selected( $status, 'en_cours' ); ?>>En cours</option>
		<option value="traite" <?php selected( $status, 'traite' ); ?>>Traite</option>
		<option value="refuse" <?php selected( $status, 'refuse' ); ?>>Refuse</option>
	</select>
	<?php
}

add_action( 'save_post_demande_devis', 'hermitage_devis_save_status' );

function hermitage_devis_save_status( $post_id ) {
	if ( ! isset( $_POST['hermitage_devis_status_nonce'] ) ) return;
	if ( ! wp_verify_nonce( $_POST['hermitage_devis_status_nonce'], 'hermitage_devis_status' ) ) return;
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;

	if ( isset( $_POST['hermitage_devis_status'] ) ) {
		$allowed = array( 'nouveau', 'en_cours', 'traite', 'refuse' );
		$value   = sanitize_text_field( $_POST['hermitage_devis_status'] );
		if ( in_array( $value, $allowed, true ) ) {
			update_post_meta( $post_id, '_devis_status', $value );
		}
	}
}

function hermitage_devis_meta_box_html( $post ) {
	$name    = get_post_meta( $post->ID, '_devis_contact_name', true );
	$email   = get_post_meta( $post->ID, '_devis_contact_email', true );
	$company = get_post_meta( $post->ID, '_devis_contact_company', true );
	$phone   = get_post_meta( $post->ID, '_devis_contact_phone', true );
	$msg     = get_post_meta( $post->ID, '_devis_message', true );
	$cat     = get_post_meta( $post->ID, '_devis_category', true );
	$group   = get_post_meta( $post->ID, '_devis_group_size', true );
	$dur     = get_post_meta( $post->ID, '_devis_duration', true );
	$total   = get_post_meta( $post->ID, '_devis_budget_total', true );
	$detail  = json_decode( get_post_meta( $post->ID, '_devis_budget_detail', true ), true );
	$sels    = json_decode( get_post_meta( $post->ID, '_devis_selections', true ), true );

	$section_style = 'margin-bottom:20px;padding:15px;background:#f9f9f9;border:1px solid #e0e0e0;border-radius:4px;';
	$label_style   = 'font-weight:600;color:#1d2327;min-width:140px;display:inline-block;';
	?>
	<div style="max-width:800px;">

		<!-- Contact -->
		<div style="<?php echo $section_style; ?>">
			<h3 style="margin-top:0;border-bottom:1px solid #ccc;padding-bottom:8px;">Contact</h3>
			<p><span style="<?php echo $label_style; ?>">Nom :</span> <?php echo esc_html( $name ); ?></p>
			<p><span style="<?php echo $label_style; ?>">Email :</span> <a href="mailto:<?php echo esc_attr( $email ); ?>"><?php echo esc_html( $email ); ?></a></p>
			<?php if ( $company ) : ?>
				<p><span style="<?php echo $label_style; ?>">Entreprise :</span> <?php echo esc_html( $company ); ?></p>
			<?php endif; ?>
			<?php if ( $phone ) : ?>
				<p><span style="<?php echo $label_style; ?>">Telephone :</span> <?php echo esc_html( $phone ); ?></p>
			<?php endif; ?>
			<?php if ( $msg ) : ?>
				<p><span style="<?php echo $label_style; ?>">Message :</span></p>
				<blockquote style="margin:5px 0 0 0;padding:10px;background:#fff;border-left:3px solid #2271b1;"><?php echo nl2br( esc_html( $msg ) ); ?></blockquote>
			<?php endif; ?>
		</div>

		<!-- Sejour -->
		<div style="<?php echo $section_style; ?>">
			<h3 style="margin-top:0;border-bottom:1px solid #ccc;padding-bottom:8px;">Sejour</h3>
			<p><span style="<?php echo $label_style; ?>">Categorie :</span> <?php echo esc_html( $cat ?: '—' ); ?></p>
			<p><span style="<?php echo $label_style; ?>">Participants :</span> <?php echo esc_html( $group ); ?></p>
			<p><span style="<?php echo $label_style; ?>">Duree :</span> <?php echo esc_html( $dur ); ?> jour(s)</p>
		</div>

		<!-- Budget -->
		<div style="<?php echo $section_style; ?>">
			<h3 style="margin-top:0;border-bottom:1px solid #ccc;padding-bottom:8px;">Budget estime</h3>
			<?php if ( is_array( $detail ) ) : ?>
				<table style="width:100%;border-collapse:collapse;">
					<?php
					$rows = array(
						'base'         => 'Base',
						'activites'    => 'Activites',
						'espaces'      => 'Espaces',
						'hebergements' => 'Hebergements',
						'services'     => 'Services',
					);
					foreach ( $rows as $key => $label ) :
						$val = isset( $detail[ $key ] ) ? floatval( $detail[ $key ] ) : 0;
						if ( $val <= 0 ) continue;
						?>
						<tr>
							<td style="padding:4px 8px;border-bottom:1px solid #eee;"><?php echo esc_html( $label ); ?></td>
							<td style="padding:4px 8px;border-bottom:1px solid #eee;text-align:right;"><?php echo esc_html( number_format( $val, 0, ',', ' ' ) ); ?> EUR</td>
						</tr>
					<?php endforeach; ?>
					<tr style="font-weight:bold;font-size:14px;">
						<td style="padding:8px;">TOTAL</td>
						<td style="padding:8px;text-align:right;"><?php echo esc_html( number_format( floatval( $total ), 0, ',', ' ' ) ); ?> EUR</td>
					</tr>
				</table>
			<?php else : ?>
				<p><strong><?php echo esc_html( number_format( floatval( $total ), 0, ',', ' ' ) ); ?> EUR</strong></p>
			<?php endif; ?>
		</div>

		<!-- Selections -->
		<?php if ( is_array( $sels ) ) : ?>
		<div style="<?php echo $section_style; ?>">
			<h3 style="margin-top:0;border-bottom:1px solid #ccc;padding-bottom:8px;">Selections</h3>

			<?php if ( ! empty( $sels['days'] ) && is_array( $sels['days'] ) ) : ?>
				<h4>Programme</h4>
				<?php foreach ( $sels['days'] as $day ) : ?>
					<p style="margin:4px 0;"><strong>Jour <?php echo esc_html( $day['dayNumber'] ?? '?' ); ?></strong></p>
					<?php if ( ! empty( $day['slots'] ) ) : ?>
						<ul style="margin:4px 0 12px 20px;">
						<?php foreach ( $day['slots'] as $slot ) : ?>
							<li>
								<?php echo esc_html( $slot['heure_debut'] ?? '' ); ?> –
								<?php
								if ( ! empty( $slot['activite_slug'] ) ) {
									echo 'Activite : ' . esc_html( $slot['activite_slug'] );
								} elseif ( ! empty( $slot['espace_slug'] ) ) {
									echo 'Espace : ' . esc_html( $slot['espace_slug'] );
								} elseif ( ! empty( $slot['label_personnalise'] ) ) {
									echo esc_html( $slot['label_personnalise'] );
								} else {
									echo esc_html( $slot['type_creneau'] ?? 'libre' );
								}
								?>
							</li>
						<?php endforeach; ?>
						</ul>
					<?php endif; ?>
				<?php endforeach; ?>
			<?php endif; ?>

			<?php if ( ! empty( $sels['accommodations'] ) && is_array( $sels['accommodations'] ) ) : ?>
				<h4>Hebergements</h4>
				<ul style="margin:4px 0 12px 20px;">
				<?php foreach ( $sels['accommodations'] as $acc ) : ?>
					<li><?php echo esc_html( $acc['hebergement_slug'] ?? '?' ); ?> x <?php echo esc_html( $acc['quantity'] ?? '?' ); ?></li>
				<?php endforeach; ?>
				</ul>
			<?php endif; ?>

			<?php if ( ! empty( $sels['services'] ) && is_array( $sels['services'] ) ) : ?>
				<h4>Services</h4>
				<ul style="margin:4px 0 12px 20px;">
				<?php foreach ( $sels['services'] as $svc ) : ?>
					<li><?php echo esc_html( $svc['service_slug'] ?? '?' ); ?></li>
				<?php endforeach; ?>
				</ul>
			<?php endif; ?>
		</div>
		<?php endif; ?>

	</div>
	<?php
}

/**
 * Disable block editor for demande_devis (use classic meta box UI).
 */
add_filter( 'use_block_editor_for_post_type', 'hermitage_devis_disable_gutenberg', 10, 2 );

function hermitage_devis_disable_gutenberg( $use, $post_type ) {
	if ( $post_type === 'demande_devis' ) return false;
	return $use;
}

/**
 * -------------------------------------------------------------------------
 * 8. Default Taxonomy Terms on Activation
 * -------------------------------------------------------------------------
 */
register_activation_hook( __FILE__, 'hermitage_activate' );

function hermitage_activate() {

	/* Make sure CPT and taxonomies are registered before inserting terms. */
	hermitage_register_sejour_template_cpt();
	hermitage_register_demande_devis_cpt();
	hermitage_register_taxonomies();

	/* --- sejour_category (slugs alignes avec le front-end types.ts) --- */
	$sejour_categories = array(
		'cohesion-team-building' => 'Cohesion & Team Building',
		'seminaire-strategique'  => 'Seminaire strategique',
		'incentive-recompense'   => 'Incentive & Recompense',
		'deconnexion-bien-etre'  => 'Deconnexion & Bien-etre',
		'onboarding-integration' => 'Onboarding & Integration',
	);
	foreach ( $sejour_categories as $slug => $name ) {
		if ( ! term_exists( $slug, 'sejour_category' ) ) {
			wp_insert_term( $name, 'sejour_category', array( 'slug' => $slug ) );
		}
	}

	/* --- activite_type (slugs alignes avec le front-end demo-data.ts) --- */
	$activite_types = array(
		'sport-aventure'        => 'Sport & Aventure',
		'gastronomie-oenologie' => 'Gastronomie & Oenologie',
		'bien-etre-relaxation'  => 'Bien-etre & Relaxation',
		'jeux-challenges'       => 'Jeux & Challenges',
		'creatif-culture'       => 'Creatif & Culture',
	);
	foreach ( $activite_types as $slug => $name ) {
		if ( ! term_exists( $slug, 'activite_type' ) ) {
			wp_insert_term( $name, 'activite_type', array( 'slug' => $slug ) );
		}
	}

	/* --- espace_type --- */
	$espace_types = array(
		'Salle de reunion',
		'Amphitheatre',
		'Espace coworking',
		'Salle de formation',
		'Espace exterieur',
		'Espace modulable',
	);
	foreach ( $espace_types as $term ) {
		if ( ! term_exists( $term, 'espace_type' ) ) {
			wp_insert_term( $term, 'espace_type' );
		}
	}

	/* --- hebergement_type --- */
	$hebergement_types = array(
		'Chambre individuelle',
		'Chambre double',
		'Suite',
		'Dortoir',
		'Gite',
		'Lodge',
	);
	foreach ( $hebergement_types as $term ) {
		if ( ! term_exists( $term, 'hebergement_type' ) ) {
			wp_insert_term( $term, 'hebergement_type' );
		}
	}

	/* --- service_category (slugs alignes avec le front-end demo-data.ts) --- */
	$service_categories = array(
		'restauration'         => 'Restauration',
		'transport-logistique' => 'Transport & Logistique',
		'animation-soiree'     => 'Animation de soiree',
		'bien-etre'            => 'Bien-etre',
		'sur-mesure'           => 'Sur mesure',
	);
	foreach ( $service_categories as $slug => $name ) {
		if ( ! term_exists( $slug, 'service_category' ) ) {
			wp_insert_term( $name, 'service_category', array( 'slug' => $slug ) );
		}
	}

	/* Flush rewrite rules after registering CPT. */
	flush_rewrite_rules();
}

/**
 * -------------------------------------------------------------------------
 * 9. WP-CLI: Import demo data from JSON
 *    Usage: wp hermitage-sim import [--force]
 * -------------------------------------------------------------------------
 */
if ( defined( 'WP_CLI' ) && WP_CLI ) {

	WP_CLI::add_command( 'hermitage-sim import', 'hermitage_cli_import_data' );

	/**
	 * Import simulateur demo data from simulateur-data.json.
	 *
	 * ## OPTIONS
	 *
	 * [--force]
	 * : Overwrite existing posts (matched by slug) instead of skipping them.
	 *
	 * @param array $args       Positional args.
	 * @param array $assoc_args Named args.
	 */
	function hermitage_cli_import_data( $args, $assoc_args ) {
		$force = isset( $assoc_args['force'] );
		$file  = plugin_dir_path( __FILE__ ) . 'data/simulateur-data.json';

		if ( ! file_exists( $file ) ) {
			WP_CLI::error( 'Fichier introuvable : ' . $file );
		}

		$data = json_decode( file_get_contents( $file ), true );
		if ( ! $data ) {
			WP_CLI::error( 'JSON invalide.' );
		}

		/* --- Taxonomies --- */
		if ( ! empty( $data['taxonomies'] ) ) {
			foreach ( $data['taxonomies'] as $taxonomy => $terms ) {
				foreach ( $terms as $slug => $name ) {
					if ( ! term_exists( $slug, $taxonomy ) ) {
						wp_insert_term( $name, $taxonomy, array( 'slug' => $slug ) );
						WP_CLI::log( "  + terme '$slug' dans '$taxonomy'" );
					}
				}
			}
		}

		/* --- Espaces (post type: espace-de-travail) --- */
		if ( ! empty( $data['espaces'] ) ) {
			WP_CLI::log( "\n-- Espaces de travail --" );
			foreach ( $data['espaces'] as $item ) {
				hermitage_cli_upsert_post( 'espace-de-travail', $item, $force );
			}
		}

		/* --- Services --- */
		if ( ! empty( $data['services'] ) ) {
			WP_CLI::log( "\n-- Services --" );
			foreach ( $data['services'] as $item ) {
				hermitage_cli_upsert_post( 'service', $item, $force );
			}
		}

		/* --- Hebergements --- */
		if ( ! empty( $data['hebergements'] ) ) {
			WP_CLI::log( "\n-- Hebergements --" );
			foreach ( $data['hebergements'] as $item ) {
				hermitage_cli_upsert_post( 'hebergement', $item, $force );
			}
		}

		/* --- Activites --- */
		if ( ! empty( $data['activites'] ) ) {
			WP_CLI::log( "\n-- Activites --" );
			foreach ( $data['activites'] as $item ) {
				hermitage_cli_upsert_post( 'activite', $item, $force );
			}
		}

		/* --- Sejour Templates --- */
		if ( ! empty( $data['sejour_templates'] ) ) {
			WP_CLI::log( "\n-- Sejour Templates --" );
			foreach ( $data['sejour_templates'] as $item ) {
				hermitage_cli_upsert_sejour_template( $item, $force );
			}
		}

		/* --- Settings (ACF options page) --- */
		if ( ! empty( $data['settings'] ) && function_exists( 'update_field' ) ) {
			WP_CLI::log( "\n-- Settings --" );
			foreach ( $data['settings'] as $field_name => $value ) {
				if ( $field_name === 'periodes_haute_saison' && is_array( $value ) ) {
					update_field( $field_name, $value, 'option' );
				} else {
					update_field( $field_name, $value, 'option' );
				}
				WP_CLI::log( "  = setting '$field_name'" );
			}
		}

		WP_CLI::success( 'Import termine.' );
	}

	/**
	 * Insert or update a post and set its ACF fields + taxonomy terms.
	 */
	function hermitage_cli_upsert_post( $post_type, $item, $force ) {
		$slug  = $item['slug'];
		$title = $item['title'];

		$existing = get_posts( array(
			'post_type'      => $post_type,
			'name'           => $slug,
			'post_status'    => 'any',
			'posts_per_page' => 1,
		) );

		if ( ! empty( $existing ) && ! $force ) {
			WP_CLI::log( "  ~ skip '$slug' (existe deja, utiliser --force)" );
			return $existing[0]->ID;
		}

		$post_data = array(
			'post_type'   => $post_type,
			'post_status' => 'publish',
			'post_title'  => $title,
			'post_name'   => $slug,
		);

		if ( ! empty( $existing ) ) {
			$post_data['ID'] = $existing[0]->ID;
			$post_id = wp_update_post( $post_data, true );
			$action  = 'updated';
		} else {
			$post_id = wp_insert_post( $post_data, true );
			$action  = 'created';
		}

		if ( is_wp_error( $post_id ) ) {
			WP_CLI::warning( "  ! erreur '$slug' : " . $post_id->get_error_message() );
			return 0;
		}

		/* Taxonomy terms */
		if ( ! empty( $item['taxonomy'] ) ) {
			foreach ( $item['taxonomy'] as $taxonomy => $term_slug ) {
				$term_slugs = is_array( $term_slug ) ? $term_slug : array( $term_slug );
				wp_set_object_terms( $post_id, $term_slugs, $taxonomy );
			}
		}

		/* ACF fields */
		if ( ! empty( $item['acf'] ) && function_exists( 'update_field' ) ) {
			foreach ( $item['acf'] as $field_name => $value ) {
				update_field( $field_name, $value, $post_id );
			}
		}

		WP_CLI::log( "  + $action '$slug' (ID $post_id)" );
		return $post_id;
	}

	/**
	 * Import a sejour template, resolving post_object references by slug.
	 */
	function hermitage_cli_upsert_sejour_template( $item, $force ) {
		/* Resolve slug references in programme_defaut to post IDs */
		if ( ! empty( $item['acf']['programme_defaut'] ) ) {
			foreach ( $item['acf']['programme_defaut'] as &$jour ) {
				if ( empty( $jour['creneaux'] ) ) continue;
				foreach ( $jour['creneaux'] as &$creneau ) {
					if ( ! empty( $creneau['activite_suggeree'] ) ) {
						$creneau['activite_suggeree'] = hermitage_cli_slug_to_id( 'activite', $creneau['activite_suggeree'] );
					}
					if ( ! empty( $creneau['espace_suggere'] ) ) {
						$creneau['espace_suggere'] = hermitage_cli_slug_to_id( 'espace-de-travail', $creneau['espace_suggere'] );
					}
					if ( ! empty( $creneau['service_suggere'] ) ) {
						$creneau['service_suggere'] = hermitage_cli_slug_to_id( 'service', $creneau['service_suggere'] );
					}
				}
			}
		}

		return hermitage_cli_upsert_post( 'sejour_template', $item, $force );
	}

	/**
	 * Find a post ID from its slug and post type.
	 */
	function hermitage_cli_slug_to_id( $post_type, $slug ) {
		if ( empty( $slug ) ) return '';

		$posts = get_posts( array(
			'post_type'      => $post_type,
			'name'           => $slug,
			'post_status'    => 'any',
			'posts_per_page' => 1,
			'fields'         => 'ids',
		) );

		if ( ! empty( $posts ) ) {
			return $posts[0];
		}

		WP_CLI::warning( "  ? slug '$slug' introuvable dans '$post_type'" );
		return '';
	}
}
