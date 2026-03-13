# Compile AAMP arXiv paper
# Requires: pdflatex + bibtex  (install via MacTeX: brew install --cask mactex)
# Or use Overleaf: upload main.tex + references.bib

MAIN = main

.PHONY: all clean

all: $(MAIN).pdf

$(MAIN).pdf: $(MAIN).tex references.bib
	pdflatex -interaction=nonstopmode $(MAIN)
	bibtex $(MAIN)
	pdflatex -interaction=nonstopmode $(MAIN)
	pdflatex -interaction=nonstopmode $(MAIN)

clean:
	rm -f *.aux *.bbl *.blg *.log *.out *.toc *.fls *.fdb_latexmk
