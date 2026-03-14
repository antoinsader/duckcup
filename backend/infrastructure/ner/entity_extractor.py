from .spacy_model import get_nlp


from application.exceptions import InfrastructureError, INFRA_ERROR_LAYERS
from infrastructure.cache.cache_store import InMemoryLruCache
_entities_analysis_cache = InMemoryLruCache(max_size=256)




ENTITY_TYPE_DESCRIPTIONS = {
    "CARDINAL": "number value",
    "DATE": "calendar date",
    "EVENT": "named event",
    "FAC": "buildings/sites",
    "GPE": "country/city/state",
    "LANGUAGE": "spoken language",
    "LAW": "legal references",
    "LOC": "location place",
    "MONEY": "money amount",
    "NORP": "political groups",
    "ORDINAL": "rank position",
    "ORG": "organization name",
    "PERCENT": "percentage value",
    "PERSON": "person name",
    "PRODUCT": "product name",
    "QUANTITY": "measured amount",
    "TIME": "time expression",
    "WORK_OF_ART": "art title",
}


def extract_entities_from_messages(
    messages_texts,
    messages_ids,
    cache_key: str = None,
    exclude_entities_labels = ['CARDINAL', 'ORDINAL', 'PERCENT', 'QUANTITY', 'TIME', 'DATE']) -> dict:
    """Get spacy entities from list of messages. Returns dict of entities types, each entity type has a dict of labels and each label has a list of ids including this label
     Example: {'Person': {'Donal Trump': [1,2], 'Tony Stark': [1]}, 'NORP': { 'American': [1,3], 'Muslim': [4], ... }, ...} 
    """


    if cache_key is not None:
        cached_result = _entities_analysis_cache.get(cache_key)
        if cached_result is not None:
            return cached_result


    try:
        nlp = get_nlp()
    except Exception as ex:
        raise InfrastructureError(
            f"Error loading spacy model for entity extraction",
            layer=INFRA_ERROR_LAYERS.NER,
            ex=ex,
            priority=1
        )

    entities_by_label = {}

    for doc, message_id in nlp.pipe(
        zip(messages_texts, messages_ids), as_tuples=True, batch_size=50
    ):
        seen_in_message = set()

        for ent in doc.ents:
            if ent.label_ in exclude_entities_labels:
                continue
            dedupe_key = (ent.label_, ent.text)
            if dedupe_key in seen_in_message:
                continue
            seen_in_message.add(dedupe_key)

            label_bucket = entities_by_label.setdefault(ent.label_, {})
            message_ids_list = label_bucket.setdefault(ent.text, [])
            message_ids_list.append(message_id)

    sorted_labels = sorted(
        entities_by_label.items(), key=lambda item: len(item[1]), reverse=True
    )

    sorted_result = {
        label: dict(
            sorted(
                label_entities.items(),
                key=lambda entity_item: len(entity_item[1]),
                reverse=True,
            )
        )
        for label, label_entities in sorted_labels
    }

    if cache_key is not None:
        _entities_analysis_cache.set(cache_key, sorted_result)

    return sorted_result
