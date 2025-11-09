// src/pages/AddArchivePage.jsx
import React from 'react';
import AddArchiveForm from '../components/AddArchiveForm';

const AddArchivePage = () => {
  return (
    <div className="flex h-screen">
      <div className="flex-1 p-8">
        <div className="mt-6 max-w-2xl">
          <AddArchiveForm />

          {/* --- Legend with line breaks --- */}
          <div className="mt-10 bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm text-sm text-gray-700">
            <div className="flex items-center mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-9-4a1 1 0 112 0v4a1 1 0 11-2 0V6zm1 8a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="font-semibold text-gray-800">Abréviations Judilibre</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 leading-relaxed">
              <div>
                <p className="font-medium text-gray-800 mb-1">Juridiction</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>CC</strong> : Cour de cassation</li>
                  <li><strong>CA</strong> : Cour d’appel</li>
                  <li><strong>TJ</strong> : Tribunal judiciaire</li>
                  <li><strong>CPH</strong> : Conseil de prud’hommes</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-gray-800 mb-1">Type d’affaire</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>CIV</strong> : Civil</li>
                  <li><strong>PEN</strong> : Pénal</li>
                  <li><strong>SOC</strong> : Social</li>
                  <li><strong>ADM</strong> : Administratif</li>
                </ul>
              </div>
            </div>
          </div>
          {/* --- End of the legend --- */}

        </div>
      </div>
    </div>
  );
};

export default AddArchivePage;
