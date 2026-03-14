import { apiRequest } from "../api/api";

export const get_dataset_important_tokens = async (
	dataset_id,
	{
		maximum_gram = 3,
		grams_n = 100,
	} = {},
) => {
	const data = await apiRequest({
		route: "nlp/get_important_tokens",
		body: {
			dataset_id,
			maximum_gram,
			grams_n,
		},
	});

	return data;
};


export const get_dataset_keywords = async (
	dataset_id,
	{
		grams_n = 100,
	} = {},
) => {
	const data = await apiRequest({
		route: "nlp/get_dataset_keywords",
		body: {
			dataset_id,
			grams_n,
		},
		timeout: 360000
	});

	return data;
};


export const get_dataset_clusters_per_sender = async (
	dataset_id,
	{
		clustering_algorithm = "tokens_kmeans",
		k_clusters = 4,
		embedder_type = "sentence_transformers",
		model = "",
	} = {},
) => {
	const data = await apiRequest({
		route: "nlp/clusters_per_sender",
		body: {
			dataset_id,
			clustering_algorithm,
			k_clusters,
			embedder_type,
			embedder_model: model,
		},
	});

	return data;
};

export const get_dataset_clusters_all = async (
	dataset_id,
	{
		clustering_algorithm = "tokens_kmeans",
		k_clusters = 4,
		embedder_type = "sentence_transformers",
		model = "",
	} = {},
) => {
	const data = await apiRequest({
		route: "nlp/clusters_all",
		body: {
			dataset_id,
			clustering_algorithm,
			k_clusters,
			embedder_type,
			embedder_model: model,
		},
	});

	return data;
};

export const get_cluster_prompt = async (
	dataset_id, cluster_docs_ids = [], provider, model
) => {
	// {"title": str, "prompt": str}
	const data = await apiRequest({
		route: "nlp/get_cluster_title_prompt",
		body: {
			dataset_id,
			cluster_docs_ids,
			provider, 
			model
		},
	});

	return data;
};


export const get_group_messages_summarize_prompt = async (
	dataset_id, group_message_docs_ids, 
) => {
	//Returns {prompt: str, input_token_size_estimated: int, output_token_size_estimated: int}
	const data = await apiRequest({
		route: "nlp/get_group_messages_summary_prompt",
		body: {
			dataset_id,
			cluster_docs_ids: group_message_docs_ids,
		},
	});

	return data;
}



export const get_group_messages_summary = async (
	dataset_id, group_message_docs_ids, model, provider 
) => {
	//Returns {answer: str, input_token_size_estimated: int, output_token_size_estimated: int}
	const data = await apiRequest({
		route: "nlp/get_group_messages_summary",
		body: {
			dataset_id,
			cluster_docs_ids: group_message_docs_ids,
			model,
			provider
		},
	});

	return data;
}

