
from collections import defaultdict
import numpy as np
import re

from sklearn.feature_extraction.text import CountVectorizer
import re

from application.exceptions import INFRA_ERROR_LAYERS, InfrastructureError, InfrastructureWarning




def get_top_senders(data_dicts: list[dict], percentile=85, sender_attribute='sender_signature'):
    """
    Parameters:
    -------------
    data_dicts: list[dict]
        list of emails or messages, each as dictionary
    sender_attribute: str 
        the key of the sender in data_dicts item
    percentile: int
        Threshold of how many emails this sender has in the list
    Returns:
        dict(sender, count of emails)
    """
    senders = defaultdict(int)
    for m in data_dicts:
        if m[sender_attribute] not in senders:
            senders[m[sender_attribute]] = 0
        senders[m[sender_attribute]] += 1
    counts = list(senders.values())
    threshold = np.percentile(counts, percentile)
    top_senders = {name: count for name, count in senders.items() if count >= threshold}
    return dict(sorted(top_senders.items(), key=lambda item: item[1], reverse=True))


def clean_repeated_grams(texts, min_df=0.5, ngram_range_tuple=(3,20)):
    # ! do this step before tokenization
    
    """"
    Parameters:
    --------------
    texts: list[str]
        list of texts to clean the repeated grams from it

    Analysis:
    	- Use SKLEARN counterVectorizer for ngrams (5,20) and min_df 0.95 and get_features_names_out(), this would give me a list of 5-grams to 20-grams that are repeated in more than 0.95 of times 
    	- if we have found 15-gram that is repeated, it might have sub of it in the 5-grams, that's why we need to filter out some of them that exists multiple times and take only the longer
	    - After we will remove those repeated grams from the senteneces
        - Will return (cleaned_texts, final_grams) final_grams is a list of repeated grams
    """
    vec = CountVectorizer(
        ngram_range=ngram_range_tuple,
        min_df=min_df,
        binary=True,
        token_pattern=r'(?u)\b\w+\b'
    )
    try:
        vec.fit(texts)
        frequent_ngrams = vec.get_feature_names_out()
    except ValueError:
        InfrastructureWarning(f"No repeated grams found. len_texts: {len(texts)}", layer=INFRA_ERROR_LAYERS.PROCESSING )
        return texts, []
    except Exception as ex:
        raise InfrastructureError(
            f"Error cleaning repeated grams",
            layer=INFRA_ERROR_LAYERS.PROCESSING,
            priority=1,
            ex=ex
        )



    # step 2
    sorted_grams = sorted(frequent_ngrams, key=len, reverse=True)
    final_ngrams = []
    for candidate in sorted_grams:
        if not any(candidate in one_repeated for one_repeated in final_ngrams):
            final_ngrams.append(candidate)



    #step 3
    pattern_str = r'\b(' + '|'.join(map(re.escape, final_ngrams)) + r')\b'
    reg_compiled = re.compile(pattern_str, flags=re.IGNORECASE)

    cleaned_texts = [
        reg_compiled.sub(" ", text).strip() 
        for text in texts
    ]

    cleaned_texts = [" ".join(text.split()) for text in cleaned_texts]
    return cleaned_texts, final_ngrams
