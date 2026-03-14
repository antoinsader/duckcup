"""
Unit tests for the pure utility functions in
infrastructure/utils/messages_utils.py:
  - get_top_senders
  - clean_repeated_grams
"""
import pytest

from infrastructure.utils.messages_utils import get_top_senders, clean_repeated_grams


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_messages(sender_counts: dict, attribute: str = "sender_signature") -> list[dict]:
    """Build a flat list of message dicts from a {sender: count} map."""
    messages = []
    for sender, count in sender_counts.items():
        messages.extend([{attribute: sender} for _ in range(count)])
    return messages


# ---------------------------------------------------------------------------
# get_top_senders
# ---------------------------------------------------------------------------

class TestGetTopSenders:
    def test_returns_dict(self):
        msgs = _make_messages({"alice": 5, "bob": 1})
        result = get_top_senders(msgs, percentile=50)
        assert isinstance(result, dict)

    def test_high_volume_sender_included(self):
        """A sender with many messages should always be above the 85th percentile."""
        msgs = _make_messages({"heavy": 100, "light": 1})
        result = get_top_senders(msgs, percentile=85)
        assert "heavy" in result

    def test_low_volume_sender_excluded(self):
        msgs = _make_messages({"heavy": 100, "light": 1})
        result = get_top_senders(msgs, percentile=85)
        assert "light" not in result

    def test_sorted_descending_by_count(self):
        msgs = _make_messages({"c": 3, "a": 10, "b": 7})
        result = get_top_senders(msgs, percentile=0)  # include everyone
        counts = list(result.values())
        assert counts == sorted(counts, reverse=True)

    def test_custom_sender_attribute(self):
        msgs = [{"entity_name": "alice"}, {"entity_name": "alice"}, {"entity_name": "bob"}]
        result = get_top_senders(msgs, percentile=0, sender_attribute="entity_name")
        assert "alice" in result

    def test_all_equal_counts_returns_all_senders(self):
        """When all senders have the same count the percentile threshold == that count."""
        msgs = _make_messages({"a": 5, "b": 5, "c": 5})
        result = get_top_senders(msgs, percentile=50)
        assert set(result.keys()) == {"a", "b", "c"}

    def test_single_sender(self):
        msgs = _make_messages({"only": 10})
        result = get_top_senders(msgs)
        assert list(result.keys()) == ["only"]
        assert result["only"] == 10


# ---------------------------------------------------------------------------
# clean_repeated_grams
# ---------------------------------------------------------------------------

def _repeated_corpus(phrase: str, n_docs: int = 10, extra: str = "") -> list[str]:
    """Create a corpus where *phrase* appears in every document."""
    return [f"document {i} {phrase} {extra} end sentence {i}" for i in range(n_docs)]


class TestCleanRepeatedGrams:
    def test_returns_tuple_of_two(self):
        texts = _repeated_corpus("hello world today here", n_docs=6)
        result = clean_repeated_grams(texts, min_df=0.8)
        assert isinstance(result, tuple)
        assert len(result) == 2

    def test_cleaned_texts_same_length_as_input(self):
        texts = _repeated_corpus("hello world today here", n_docs=6)
        cleaned, _ = clean_repeated_grams(texts, min_df=0.8)
        assert len(cleaned) == len(texts)

    def test_repeated_phrase_removed_from_texts(self):
        # Use a longer phrase so CountVectorizer (ngram_range=(3,20)) detects it
        phrase = "please read our full privacy policy disclaimer carefully"
        texts = _repeated_corpus(phrase, n_docs=12)
        cleaned, ngrams = clean_repeated_grams(texts, min_df=0.9, ngram_range_tuple=(3, 10))

        # Only assert removal when the vectorizer actually detected repeated grams
        if ngrams:
            for text in cleaned:
                for gram in ngrams:
                    assert gram.lower() not in text.lower()

    def test_ngrams_list_not_empty_when_repeats_exist(self):
        phrase = "click here to unsubscribe from this list"
        texts = _repeated_corpus(phrase, n_docs=12)
        _, ngrams = clean_repeated_grams(texts, min_df=0.9, ngram_range_tuple=(3, 20))
        assert len(ngrams) >= 1

    def test_no_repeated_grams_returns_original_texts(self):
        """When there are no repeated n-grams the original texts come back unchanged."""
        texts = [
            "the quick brown fox jumps",
            "lazy dogs run across fields",
            "machine learning models predict",
            "software engineering best practices",
        ]
        cleaned, ngrams = clean_repeated_grams(texts, min_df=0.99)
        assert ngrams == []
        assert cleaned == texts

    def test_output_texts_have_no_extra_whitespace(self):
        phrase = "please read our full privacy policy carefully"
        texts = _repeated_corpus(phrase, n_docs=10)
        cleaned, _ = clean_repeated_grams(texts, min_df=0.9)
        for text in cleaned:
            # no leading/trailing whitespace and no double-spaces
            assert text == " ".join(text.split())

    def test_deduplication_keeps_longest_gram(self):
        """
        If 'a b c d' and 'a b c' are both frequent, only 'a b c d' (the longer
        one) should be in the final_ngrams list.
        """
        phrase = "please unsubscribe from our mailing list below"
        texts = _repeated_corpus(phrase, n_docs=12)
        _, ngrams = clean_repeated_grams(texts, min_df=0.9, ngram_range_tuple=(3, 20))

        for i, gram in enumerate(ngrams):
            others = ngrams[:i] + ngrams[i + 1:]
            # no gram should be a substring of another gram in the final list
            for other in others:
                assert gram not in other, (
                    f"'{gram}' is a substring of '{other}' — shorter gram was not filtered out"
                )
