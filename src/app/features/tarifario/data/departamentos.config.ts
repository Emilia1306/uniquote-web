export const DEPARTAMENTOS = {
    'OPERACIONES': ['TRABAJO DE CAMPO', 'LOGISTICA', 'VIATICOS'],
    'RECURSOS': ['RECURSOS HUMANOS', 'PERSONAL', 'INCENTIVOS'],
    'TECNOLOGIA': ['EQUIPOS', 'SOFTWARE', 'LICENCIAS'],
    'OTROS': ['ADMINISTRACION', 'OTROS']
};

export const DEFAULT_DEPARTAMENTO = 'OTROS';

export function getDepartment(categoria: string): string {
    const catUpper = categoria.toUpperCase();

    for (const [dept, categories] of Object.entries(DEPARTAMENTOS)) {
        if (categories.some(c => catUpper.includes(c))) {
            return dept;
        }
    }

    return DEFAULT_DEPARTAMENTO;
}
