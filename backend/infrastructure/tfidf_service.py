

from dataclasses import dataclass
from sklearn.feature_extraction.text import  TfidfVectorizer

from application.exceptions import INFRA_ERROR_LAYERS, InfrastructureError
from infrastructure.utils.config_hash import hash_config



@dataclass
class TfIdf_config:
    n_grams_tuple: tuple = (1,2)
    min_df: int =2
    max_df: float = 0.9

class TfIdf_Service():
    def __init__(self, cfg: TfIdf_config):
        self.cfg = cfg

    def get_config_hash(self) -> str:
        return hash_config(self.cfg)

    def fit_transform(self, tokenized_docs):
        """ get_tfidf_matrix before"""
        try:
            vectorizer = TfidfVectorizer(
                tokenizer=lambda x: x,
                preprocessor=lambda x: x,
                token_pattern=None,
                ngram_range=self.cfg.n_grams_tuple,
                min_df=self.cfg.min_df,
                max_df=self.cfg.max_df
            )
            tfidf_matrix = vectorizer.fit_transform(tokenized_docs)
            return tfidf_matrix
        except Exception as ex:
            raise InfrastructureError(
                "Error performing fit_transform. ",
                priority=1,
                ex=ex,
                layer=INFRA_ERROR_LAYERS.TFIDF
            )


    
def get_tfidf_list_tokens(lists_tokens, top_n=200):
    """
        args:
            list_tokens: list of lists containing tokens
        Returns:
            most important top_n tokens dict: {token: score}
    """
    vectorizer = TfidfVectorizer(
        tokenizer=lambda x: x,
        preprocessor=lambda x: x,
        token_pattern=None,
        min_df=0.1
    )
    try:
        tfidf_matrix = vectorizer.fit_transform(lists_tokens)
    except ValueError as ex:
        raise InfrastructureError(
            f"Error GENERating tfidf for the len(docs) {len(lists_tokens)}. ",
            priority=1,
            ex=ex,
            layer=INFRA_ERROR_LAYERS.TFIDF
        )



    sum_scores = tfidf_matrix.sum(axis=0)
    words = vectorizer.get_feature_names_out()
    word_scores = []
    for col, word in enumerate(words):
        score = sum_scores[0, col]
        word_scores.append({"text": word, "value": round(score, 2)})

    sorted_scores = sorted(word_scores, key=lambda x: x["value"], reverse=True)
    return sorted_scores[:top_n]


def get_tfidf_list_grams(list_texts, min_gram=1, max_gram=5, top_n=200):
    """
        Returns a list of top_n most important tokens, each item is a tuple (text, score)
    """
    results = {}
    
    vectorizer = TfidfVectorizer(
        ngram_range=(min_gram,max_gram),
        stop_words="english",
        min_df=2,
        max_df=0.95
    )
    try:
        tfidf_matrix = vectorizer.fit_transform(list_texts)
        sum_scores = tfidf_matrix.sum(axis=0)
        words = vectorizer.get_feature_names_out()
        grams_with_scores = []
        for col, g in enumerate(words):
            score = sum_scores[0, col]
            grams_with_scores.append((g, round(score, 2)))

        sorted_grams = sorted(grams_with_scores, key=lambda x: x[1], reverse=True)
        results = sorted_grams[:top_n]
        return results

    except ValueError as ex:
        raise InfrastructureError(
            f"Error GENERating get_tfidf_list_grams for the len(docs) {len(list_texts)}. ",
            priority=1,
            ex=ex,
            layer=INFRA_ERROR_LAYERS.TFIDF
        )




def generate_title_tfidf(whole_list_texts, sub_list_texts, max_tokens=5, ngrams_tuple=(1,5)):
    """
        args:
            whole_lists_texts: list of strings, which will fit the vectorizer
            sub_list_texts: list of strings, which will transform the vectorizer
            max_tokens: max token for the title
            ngram_tuple: gram for the tokens (min, max)
        Returns: 
            Title which would respect max_tokens and having the most important grams from sub_list_texts compared to the whole_list_texts
    """
    try:
        def _tokenize_keep_emoji(value):
            if value is None:
                return []
            return str(value).split()

        whole_list_texts = [str(text).strip() for text in whole_list_texts if str(text).strip()]
        sub_list_texts = [str(text).strip() for text in sub_list_texts if str(text).strip()]

        if not whole_list_texts or not sub_list_texts:
            return ""
        if not any(_tokenize_keep_emoji(text) for text in whole_list_texts):
            return ""
        if not any(_tokenize_keep_emoji(text) for text in sub_list_texts):
            return ""


        vectorizer= TfidfVectorizer(
            tokenizer=_tokenize_keep_emoji,
            preprocessor=lambda x: str(x),
            token_pattern=None,
            ngram_range=ngrams_tuple,
            stop_words=None,
            lowercase=False,
            use_idf=True,
        )
        vectorizer.fit(whole_list_texts)
        tfidf_matrix = vectorizer.transform(sub_list_texts)
        summed_scores = tfidf_matrix.sum(axis =0)
        words = vectorizer.get_feature_names_out()
        scored_words = [
            (words[col], summed_scores.item(0,col))
            for col in range(summed_scores.shape[1])
        ]
        sorted_words = sorted(scored_words, key=lambda x: x[1], reverse=True)
        seen_tokens  = set()
        final_list = []

        for tup in sorted_words:
            phrase = tup[0]
            toks = phrase.split()
            if all(token in seen_tokens for token in toks):
                continue
            seen_tokens.update(toks)
            final_list.append(tup)

        final = sorted(final_list, reverse=True, key=lambda x: x[1])
        title_toks = []
        for (sen, _) in final:
            current_toks = sen.split()
            if len(title_toks) + len(current_toks) > max_tokens and len(title_toks) != 0:
                break
            title_toks.extend(current_toks)


        title_toks = dict.fromkeys(title_toks).keys() # to keep order but remove duplicates
        title = " ".join(title_toks)
        return title
    except ValueError as ex:
        raise InfrastructureError(
            f"Error GENERating generate_title_tfidf. ",
            priority=1,
            ex=ex,
            layer=INFRA_ERROR_LAYERS.TFIDF
        )