import { useSearchParams } from 'react-router-dom';

const ResultPage = () => {
    const [params] = useSearchParams();
    const score = params.get('score');
    const total = params.get('total');

    return (
        <div className="text-center p-10">
            <h1 className="text-3xl font-bold">Quiz Results</h1>
            <p className="mt-4 text-xl">You scored {score} out of {total}</p>
        </div>
    );
};
export default ResultPage;
