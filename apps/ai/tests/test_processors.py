from app.processors import get_processor


def test_embed_is_deterministic():
    processor = get_processor("EMBED")
    a = processor({"text": "hello matchy"})
    b = processor({"text": "hello matchy"})
    assert a["embedding"] == b["embedding"]
    assert a["dimensions"] == 32


def test_match_ranks_candidates():
    processor = get_processor("MATCH")
    result = processor({"candidateIds": ["a", "b"], "query": "dev"})
    assert len(result["matches"]) == 2
    assert result["matches"][0]["score"] >= result["matches"][1]["score"]
